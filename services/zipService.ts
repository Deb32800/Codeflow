/**
 * @file services/zipService.ts
 * @description Handles ZIP archive extraction using the JSZip library.
 *              Parses the ZIP into a hierarchical FileNode tree for the
 *              project explorer sidebar, and builds a flat map of file
 *              paths → source code for the AI analysis pipeline.
 *
 *              Filters out:
 *              - macOS resource forks (__MACOSX)
 *              - .DS_Store files
 *              - node_modules directories
 *              - .git directories
 */

import JSZip from 'jszip';
import { FileNode } from '../types';
import { SUPPORTED_EXTENSIONS } from '../constants';

/**
 * Checks whether a filename has a recognized source code extension.
 * Only files passing this check will have their content read and sent to AI.
 */
const isCodeFile = (filename: string): boolean => {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? SUPPORTED_EXTENSIONS.includes(ext) : false;
};

/**
 * Extracts a ZIP file into a structured file tree and a flat content map.
 *
 * @param file - The ZIP File object from the browser's file input
 * @returns An object containing:
 *   - `rootNodes`: Hierarchical FileNode[] tree for the explorer sidebar
 *   - `fileMap`:   Flat Record<path, content> for the AI analysis pipeline
 */
export const extractZipFile = async (file: File): Promise<{ rootNodes: FileNode[], fileMap: Record<string, string> }> => {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);

  const nodesMap: Record<string, FileNode> = {};
  const contentMap: Record<string, string> = {};

  // ── Pass 1: Create file nodes from explicit ZIP entries ────────────
  for (const [relativePath, zipEntry] of Object.entries(loadedZip.files)) {
    const entry = zipEntry as JSZip.JSZipObject;

    // Skip OS artifacts and dependency directories
    if (relativePath.startsWith('__MACOSX') || relativePath.includes('.DS_Store') || relativePath.includes('node_modules') || relativePath.includes('.git/')) {
      continue;
    }

    const isFolder = entry.dir;
    const name = relativePath.split('/').filter(Boolean).pop() || relativePath;

    let content: string | undefined = undefined;

    // Only read content for code files to save memory and AI tokens
    if (!isFolder && isCodeFile(name)) {
       try {
         content = await entry.async('string');
         contentMap[relativePath] = content;
       } catch (e) {
         console.warn(`Could not read text for ${relativePath}`, e);
       }
    }

    nodesMap[relativePath] = {
      name,
      path: relativePath,
      isFolder,
      content,
      children: isFolder ? [] : undefined,
    };
  }

  // ── Pass 2: Ensure all parent folders exist (handle implicit dirs) ──
  // Some ZIP files don't have explicit directory entries, so we create
  // intermediate folder nodes as needed.
  Object.keys(nodesMap).forEach(path => {
      const parts = path.split('/');
      const cleanParts = parts.filter(p => p.length > 0);

      let currentPath = "";
      for (let i = 0; i < cleanParts.length; i++) {
          const part = cleanParts[i];
          const isLast = i === cleanParts.length - 1;

          currentPath += part + (nodesMap[path]?.isFolder || !isLast ? "/" : "");

          const isIntermediate = !isLast;

          if (isIntermediate && !nodesMap[currentPath]) {
              nodesMap[currentPath] = {
                  name: part,
                  path: currentPath,
                  isFolder: true,
                  children: []
              };
          }
      }
  });

  // ── Pass 3: Build the parent→child hierarchy ────────────────────────
  const finalRoots: FileNode[] = [];

  Object.values(nodesMap).forEach(node => {
      const pathParts = node.path.split('/').filter(Boolean);

      if (pathParts.length === 0) return;

      if (pathParts.length === 1) {
          // Top-level file or folder
          if (!finalRoots.includes(node)) finalRoots.push(node);
      } else {
          // Nested — find parent and attach
          const parentParts = pathParts.slice(0, -1);
          const parentPath = parentParts.join('/') + '/';

          const parent = nodesMap[parentPath];
          if (parent && parent.children) {
              if (!parent.children.includes(node)) {
                  parent.children.push(node);
              }
          } else {
              // Orphan node — add to root level
              if (!finalRoots.includes(node)) finalRoots.push(node);
          }
      }
  });

  // ── Sort: folders first, then alphabetical ──────────────────────────
  const sortNodes = (nodes: FileNode[]) => {
    nodes.sort((a, b) => {
      if (a.isFolder === b.isFolder) return a.name.localeCompare(b.name);
      return a.isFolder ? -1 : 1;
    });
    nodes.forEach(node => {
      if (node.children) sortNodes(node.children);
    });
  };

  sortNodes(finalRoots);

  return { rootNodes: finalRoots, fileMap: contentMap };
};