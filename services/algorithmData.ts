import { Algorithm, AlgoFrame, AlgoItem, NodeData, GridCell } from '../types';
import { Node, Edge } from 'reactflow';

// --- CODE SNIPPETS ---
const CODE_BUBBLE = {
    js: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Compare adjacent
      if (arr[j] > arr[j + 1]) {
        // Swap
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
    py: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
    cpp: `void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }
}`
};

const CODE_SELECTION = {
    js: `function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
  }
  return arr;
}`,
    py: `def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        if min_idx != i:
            arr[i], arr[min_idx] = arr[min_idx], arr[i]`,
    cpp: `void selectionSort(int arr[], int n) {
    for (int i = 0; i < n; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx])
                minIdx = j;
        }
        swap(arr[minIdx], arr[i]);
    }
}`
};

const CODE_INSERTION = {
    js: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j = j - 1;
    }
    arr[j + 1] = key;
  }
  return arr;
}`,
    py: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and key < arr[j]:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key`,
    cpp: `void insertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        arr[j + 1] = key;
    }
}`
};

const CODE_QUICK = {
    js: `function quickSort(arr, low, high) {
  if (low < high) {
    let pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
}

function partition(arr, low, high) {
  let pivot = arr[high];
  let i = (low - 1);
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`,
    py: `def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1`,
    cpp: `int partition(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = (low - 1);
    for (int j = low; j <= high - 1; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return (i + 1);
}

void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`
};

const CODE_MERGE = {
    js: `function mergeSort(arr, left, right) {
  if (left >= right) return;
  const mid = left + Math.floor((right - left) / 2);
  mergeSort(arr, left, mid);
  mergeSort(arr, mid + 1, right);
  merge(arr, left, mid, right);
}

function merge(arr, left, mid, right) {
  // Merge logic here...
}`,
    py: `def merge_sort(arr):
    if len(arr) > 1:
        mid = len(arr)//2
        L = arr[:mid]
        R = arr[mid:]
        merge_sort(L)
        merge_sort(R)
        # Merge logic`,
    cpp: `void mergeSort(int arr[], int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m + 1, r);
        merge(arr, l, m, r);
    }
}`
};

const CODE_HEAP = {
    js: `function heapSort(arr) {
  const n = arr.length;
  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--)
    heapify(arr, n, i);
  // Extract elements
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(arr, i, 0);
  }
}`,
    py: `def heap_sort(arr):
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    for i in range(n - 1, 0, -1):
        arr[i], arr[0] = arr[0], arr[i]
        heapify(arr, i, 0)`,
    cpp: `void heapSort(int arr[], int n) {
    for (int i = n / 2 - 1; i >= 0; i--)
        heapify(arr, n, i);
    for (int i = n - 1; i > 0; i--) {
        swap(arr[0], arr[i]);
        heapify(arr, i, 0);
    }
}`
};

const CODE_RADIX = {
    js: `function radixSort(arr) {
  const max = Math.max(...arr);
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    countSort(arr, exp);
  }
}`,
    py: `def radix_sort(arr):
    max1 = max(arr)
    exp = 1
    while max1 / exp > 1:
        count_sort(arr, exp)
        exp *= 10`,
    cpp: `void radixsort(int arr[], int n) {
    int m = getMax(arr, n);
    for (int exp = 1; m / exp > 0; exp *= 10)
        countSort(arr, n, exp);
}`
};

const CODE_LINEAR = {
    js: `function linearSearch(arr, x) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === x) return i;
  }
  return -1;
}`,
    py: `def linear_search(arr, x):
    for i in range(len(arr)):
        if arr[i] == x:
            return i
    return -1`,
    cpp: `int linearSearch(int arr[], int n, int x) {
    for (int i = 0; i < n; i++)
        if (arr[i] == x)
            return i;
    return -1;
}`
};

const CODE_BINARY = {
    js: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    py: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target: return mid
        if arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
    cpp: `int binarySearch(int arr[], int l, int r, int x) {
    while (l <= r) {
        int m = l + (r - l) / 2;
        if (arr[m] == x) return m;
        if (arr[m] < x) l = m + 1;
        else r = m - 1;
    }
    return -1;
}`
};

const CODE_BFS = {
    js: `function bfs(graph, start) {
  const queue = [start];
  const visited = new Set([start]);
  while (queue.length > 0) {
    const node = queue.shift();
    console.log(node);
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
}`,
    py: `def bfs(graph, start):
    queue = [start]
    visited = {start}
    while queue:
        node = queue.pop(0)
        print(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)`,
    cpp: `void bfs(vector<int> adj[], int s) {
    bool visited[V]; 
    list<int> queue;
    visited[s] = true;
    queue.push_back(s);
    while(!queue.empty()) {
        s = queue.front();
        queue.pop_front();
        for(auto i : adj[s]) {
            if(!visited[i]) {
                visited[i] = true;
                queue.push_back(i);
            }
        }
    }
}`
};

const CODE_DFS = {
    js: `function dfs(graph, node, visited = new Set()) {
  visited.add(node);
  console.log(node);
  for (const neighbor of graph[node]) {
    if (!visited.has(neighbor)) {
      dfs(graph, neighbor, visited);
    }
  }
}`,
    py: `def dfs(graph, node, visited):
    visited.add(node)
    print(node)
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited)`,
    cpp: `void dfs(int u, vector<int> adj[], vector<bool> &visited) {
    visited[u] = true;
    cout << u << " ";
    for (int v : adj[u]) {
        if (!visited[v])
            dfs(v, adj, visited);
    }
}`
};

const CODE_DIJKSTRA = {
    js: `function dijkstra(graph, start) {
  const dist = {};
  const pq = new PriorityQueue();
  dist[start] = 0;
  pq.enqueue(start, 0);
  
  while (!pq.isEmpty()) {
    const u = pq.dequeue();
    for (const neighbor of graph[u]) {
      const alt = dist[u] + neighbor.weight;
      if (alt < dist[neighbor.id]) {
        dist[neighbor.id] = alt;
        pq.enqueue(neighbor.id, alt);
      }
    }
  }
}`,
    py: `import heapq
def dijkstra(graph, start):
    pq = [(0, start)]
    dist = {node: float('inf') for node in graph}
    dist[start] = 0
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]: continue
        for v, weight in graph[u].items():
            if dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight
                heapq.heappush(pq, (dist[v], v))`,
    cpp: `void dijkstra(int src) {
    priority_queue<iPair, vector<iPair>, greater<iPair>> pq;
    pq.push(make_pair(0, src));
    dist[src] = 0;
    while (!pq.empty()) {
        int u = pq.top().second;
        pq.pop();
        for (auto x : adj[u]) {
            int v = x.first;
            int weight = x.second;
            if (dist[v] > dist[u] + weight) {
                dist[v] = dist[u] + weight;
                pq.push(make_pair(dist[v], v));
            }
        }
    }
}`
};

const CODE_ASTAR = {
    js: `function aStar(start, goal) {
  const openSet = [start];
  const gScore = { [start]: 0 };
  const fScore = { [start]: heuristic(start, goal) };

  while (openSet.length > 0) {
    const current = getLowestF(openSet, fScore);
    if (current === goal) return reconstructPath(cameFrom, current);

    for (const neighbor of getNeighbors(current)) {
      const tentative_g = gScore[current] + d(current, neighbor);
      if (tentative_g < gScore[neighbor]) {
        gScore[neighbor] = tentative_g;
        fScore[neighbor] = gScore[neighbor] + h(neighbor);
        if (!openSet.includes(neighbor)) openSet.push(neighbor);
      }
    }
  }
}`,
    py: `def a_star(start, goal):
    open_set = {start}
    g_score = {start: 0}
    f_score = {start: heuristic(start, goal)}
    while open_set:
        current = min(open_set, key=lambda x: f_score.get(x, float('inf')))
        if current == goal: return reconstruct_path(current)
        open_set.remove(current)
        for neighbor in get_neighbors(current):
            tentative_g = g_score[current] + dist(current, neighbor)
            if tentative_g < g_score.get(neighbor, float('inf')):
                g_score[neighbor] = tentative_g
                f_score[neighbor] = g_score[neighbor] + heuristic(neighbor, goal)
                open_set.add(neighbor)`,
    cpp: `// A* Search Logic (Simplified)
void aStar(Node* start, Node* target) {
    priority_queue<Node*> openSet;
    start->g = 0;
    start->f = heuristic(start, target);
    openSet.push(start);
    while(!openSet.empty()) {
        Node* current = openSet.top();
        openSet.pop();
        if(current == target) break;
        for(Node* neighbor : current->neighbors) {
            float tempG = current->g + cost(current, neighbor);
            if(tempG < neighbor->g) {
                neighbor->g = tempG;
                neighbor->f = neighbor->g + heuristic(neighbor, target);
                openSet.push(neighbor);
            }
        }
    }
}`
};

const CODE_PRIM = {
    js: `function primMST(graph) {
  const parent = [];
  const key = [];
  const mstSet = [];
  // Initialize keys as Infinite
  // Key[0] = 0
  
  for (let count = 0; count < V - 1; count++) {
    const u = minKey(key, mstSet);
    mstSet[u] = true;
    for (let v = 0; v < V; v++) {
      if (graph[u][v] && !mstSet[v] && graph[u][v] < key[v]) {
        parent[v] = u;
        key[v] = graph[u][v];
      }
    }
  }
}`,
    py: `def prim_mst(graph):
    key = [sys.maxsize] * V
    parent = [None] * V
    key[0] = 0
    mst_set = [False] * V
    parent[0] = -1
    for cout in range(V):
        u = min_key(key, mst_set)
        mst_set[u] = True
        for v in range(V):
            if graph[u][v] > 0 and not mst_set[v] and key[v] > graph[u][v]:
                key[v] = graph[u][v]
                parent[v] = u`,
    cpp: `void primMST(int graph[V][V]) {
    int parent[V], key[V];
    bool mstSet[V];
    for (int i = 0; i < V; i++) key[i] = INT_MAX, mstSet[i] = false;
    key[0] = 0; parent[0] = -1;
    for (int count = 0; count < V - 1; count++) {
        int u = minKey(key, mstSet);
        mstSet[u] = true;
        for (int v = 0; v < V; v++)
            if (graph[u][v] && !mstSet[v] && graph[u][v] < key[v])
                parent[v] = u, key[v] = graph[u][v];
    }
}`
};

const CODE_KRUSKAL = {
    js: `function kruskalMST(graph) {
  const result = [];
  let i = 0, e = 0;
  // Sort edges by weight
  graph.edges.sort((a, b) => a.w - b.w);
  
  const subsets = [];
  // Create subsets...
  
  while (e < V - 1) {
    const next_edge = graph.edges[i++];
    const x = find(subsets, next_edge.src);
    const y = find(subsets, next_edge.dest);
    
    if (x !== y) {
      result.push(next_edge);
      union(subsets, x, y);
      e++;
    }
  }
}`,
    py: `def kruskal_mst(self):
    result = []
    i, e = 0, 0
    self.graph = sorted(self.graph, key=lambda item: item[2])
    parent, rank = [], []
    # Initialize Union-Find structure
    while e < self.V - 1:
        u, v, w = self.graph[i]
        i = i + 1
        x = self.find(parent, u)
        y = self.find(parent, v)
        if x != y:
            e = e + 1
            result.append([u, v, w])
            self.union(parent, rank, x, y)`,
    cpp: `void KruskalMST(Graph* graph) {
    int V = graph->V;
    Edge result[V]; 
    qsort(graph->edge, graph->E, sizeof(graph->edge[0]), myComp);
    subset* subsets = new subset[(V * sizeof(subset))];
    // Init subsets...
    int e = 0; 
    int i = 0; 
    while (e < V - 1 && i < graph->E) {
        Edge next_edge = graph->edge[i++];
        int x = find(subsets, next_edge.src);
        int y = find(subsets, next_edge.dest);
        if (x != y) {
            result[e++] = next_edge;
            Union(subsets, x, y);
        }
    }
}`
};

const CODE_TREE_PRE = {
    js: `function preOrder(node) {
  if (node === null) return;
  console.log(node.data);
  preOrder(node.left);
  preOrder(node.right);
}`,
    py: `def pre_order(node):
    if node is None: return
    print(node.data)
    pre_order(node.left)
    pre_order(node.right)`,
    cpp: `void printPreorder(struct Node* node) {
    if (node == NULL) return;
    cout << node->data << " ";
    printPreorder(node->left);
    printPreorder(node->right);
}`
};

const CODE_TREE_IN = {
    js: `function inOrder(node) {
  if (node === null) return;
  inOrder(node.left);
  console.log(node.data);
  inOrder(node.right);
}`,
    py: `def in_order(node):
    if node is None: return
    in_order(node.left)
    print(node.data)
    in_order(node.right)`,
    cpp: `void printInorder(struct Node* node) {
    if (node == NULL) return;
    printInorder(node->left);
    cout << node->data << " ";
    printInorder(node->right);
}`
};

const CODE_TREE_POST = {
    js: `function postOrder(node) {
  if (node === null) return;
  postOrder(node.left);
  postOrder(node.right);
  console.log(node.data);
}`,
    py: `def post_order(node):
    if node is None: return
    post_order(node.left)
    post_order(node.right)
    print(node.data)`,
    cpp: `void printPostorder(struct Node* node) {
    if (node == NULL) return;
    printPostorder(node->left);
    printPostorder(node->right);
    cout << node->data << " ";
}`
};

const CODE_BST = {
    js: `function search(root, key) {
  if (root === null || root.key === key)
    return root;
  if (root.key < key)
    return search(root.right, key);
  return search(root.left, key);
}`,
    py: `def search(root, key):
    if root is None or root.val == key:
        return root
    if root.val < key:
        return search(root.right, key)
    return search(root.left, key)`,
    cpp: `struct Node* search(struct Node* root, int key) {
    if (root == NULL || root->key == key)
        return root;
    if (root->key < key)
        return search(root->right, key);
    return search(root->left, key);
}`
};

const CODE_NQUEENS = {
    js: `function solveNQUtil(board, col) {
  if (col >= N) return true;
  for (let i = 0; i < N; i++) {
    if (isSafe(board, i, col)) {
      board[i][col] = 1;
      if (solveNQUtil(board, col + 1)) return true;
      board[i][col] = 0; // Backtrack
    }
  }
  return false;
}`,
    py: `def solve_nq_util(board, col):
    if col >= N: return True
    for i in range(N):
        if is_safe(board, i, col):
            board[i][col] = 1
            if solve_nq_util(board, col + 1): return True
            board[i][col] = 0 # Backtrack
    return False`,
    cpp: `bool solveNQUtil(int board[N][N], int col) {
    if (col >= N) return true;
    for (int i = 0; i < N; i++) {
        if (isSafe(board, i, col)) {
            board[i][col] = 1;
            if (solveNQUtil(board, col + 1)) return true;
            board[i][col] = 0; // Backtrack
        }
    }
    return false;
}`
};

const CODE_MAZE = {
    js: `function generateMaze(x, y) {
  visited[x][y] = true;
  const dirs = shuffle([[0,1], [1,0], [0,-1], [-1,0]]);
  for (const [dx, dy] of dirs) {
    const nx = x + dx*2, ny = y + dy*2;
    if (isValid(nx, ny) && !visited[nx][ny]) {
      removeWall(x, y, nx, ny);
      generateMaze(nx, ny);
    }
  }
}`,
    py: `def generate_maze(x, y):
    visited[x][y] = True
    dirs = [(0,1), (1,0), (0,-1), (-1,0)]
    random.shuffle(dirs)
    for dx, dy in dirs:
        nx, ny = x + dx*2, y + dy*2
        if is_valid(nx, ny) and not visited[nx][ny]:
            remove_wall(x, y, nx, ny)
            generate_maze(nx, ny)`,
    cpp: `void generateMaze(int x, int y) {
    visited[x][y] = true;
    // Shuffle directions...
    for (auto dir : dirs) {
        int nx = x + dir.dx*2;
        int ny = y + dir.dy*2;
        if (isValid(nx, ny) && !visited[nx][ny]) {
            removeWall(x, y, nx, ny);
            generateMaze(nx, ny);
        }
    }
}`
};

// --- ALGORITHM DEFINITIONS ---
export const ALGORITHMS: Algorithm[] = [
  // I. SORTING
  { 
      id: 'bubble', name: 'Bubble Sort', category: 'Sorting', description: 'Swaps adjacent elements if they are in wrong order.', 
      learnMore: { definition: "Simplest sorting algo. Repeatedly steps through list, compares adjacent elements and swaps them.", howItWorks: ["Compare A[i] & A[i+1]", "If A[i] > A[i+1], Swap", "Repeat until sorted"], realWorldUses: ["Education", "Small datasets"] },
      complexityDetails: { timeBest: 'Ω(n)', timeAvg: 'Θ(n²)', timeWorst: 'O(n²)', space: 'O(1)' },
      code: CODE_BUBBLE
  },
  { 
      id: 'selection', name: 'Selection Sort', category: 'Sorting', description: 'Repeatedly finds the minimum element and moves it to the beginning.', 
      learnMore: { definition: "Divides list into two parts: sorted and unsorted. Picks min from unsorted and moves to sorted.", howItWorks: ["Find min in unsorted array", "Swap with first unsorted element", "Move boundary"], realWorldUses: ["Memory constrained systems"] },
      complexityDetails: { timeBest: 'Ω(n²)', timeAvg: 'Θ(n²)', timeWorst: 'O(n²)', space: 'O(1)' },
      code: CODE_SELECTION
  },
  { 
      id: 'insertion', name: 'Insertion Sort', category: 'Sorting', description: 'Builds sorted array one item at a time by shifting elements.', 
      learnMore: { definition: "Like sorting playing cards in your hand. Take one card and slide it into correct position.", howItWorks: ["Take element", "Compare with predecessors", "Shift greater elements up", "Insert"], realWorldUses: ["Small arrays", "Online algorithms"] },
      complexityDetails: { timeBest: 'Ω(n)', timeAvg: 'Θ(n²)', timeWorst: 'O(n²)', space: 'O(1)' },
      code: CODE_INSERTION
  },
  { 
      id: 'quick', name: 'Quick Sort', category: 'Sorting', description: 'Divide and conquer: Partitions array around a pivot.', 
      learnMore: { definition: "Selects a 'pivot' and partitions array so smaller elements are left, larger are right.", howItWorks: ["Pick pivot", "Partition array", "Recursively sort sub-arrays"], realWorldUses: ["Language libraries (Java, C++)"] },
      complexityDetails: { timeBest: 'Ω(n log n)', timeAvg: 'Θ(n log n)', timeWorst: 'O(n²)', space: 'O(log n)' },
      code: CODE_QUICK
  },
  { 
      id: 'merge', name: 'Merge Sort', category: 'Sorting', description: 'Recursively divides array in half and merges sorted halves.', 
      learnMore: { definition: "Stable, divide-and-conquer algorithm. Guarantees n*log(n) performance.", howItWorks: ["Divide array in half", "Sort halves recursively", "Merge sorted halves"], realWorldUses: ["Linked Lists", "External Sorting"] },
      complexityDetails: { timeBest: 'Ω(n log n)', timeAvg: 'Θ(n log n)', timeWorst: 'O(n log n)', space: 'O(n)' },
      code: CODE_MERGE
  },
  { 
      id: 'heap', name: 'Heap Sort', category: 'Sorting', description: 'Converts array to Max Heap, then extracts max repeatedly.', 
      learnMore: { definition: "Comparison-based sort using a Binary Heap data structure.", howItWorks: ["Build Max Heap", "Swap root (max) with end", "Heapify root", "Repeat"], realWorldUses: ["Systems requiring worst-case guarantees"] },
      complexityDetails: { timeBest: 'Ω(n log n)', timeAvg: 'Θ(n log n)', timeWorst: 'O(n log n)', space: 'O(1)' },
      code: CODE_HEAP
  },
  { 
      id: 'radix', name: 'Radix Sort', category: 'Sorting', description: 'Non-comparative sort. Processes digits from LSD to MSD.', 
      learnMore: { definition: "Sorts numbers by processing individual digits. Does not compare numbers directly.", howItWorks: ["Sort by 1s place", "Sort by 10s place", "Repeat for all digits"], realWorldUses: ["Sorting integers/strings", "Fixed length keys"] },
      complexityDetails: { timeBest: 'Ω(nk)', timeAvg: 'Θ(nk)', timeWorst: 'O(nk)', space: 'O(n+k)' },
      code: CODE_RADIX
  },

  // II. SEARCHING
  { 
      id: 'linear', name: 'Linear Search', category: 'Searching', description: 'Iterates through every element until match is found.', 
      learnMore: { definition: "Scans one by one. Works on unsorted data.", howItWorks: ["Check index 0", "Check index 1", "...", "Found or End"], realWorldUses: ["Unsorted lists", "Small data"] },
      complexityDetails: { timeBest: 'Ω(1)', timeAvg: 'Θ(n)', timeWorst: 'O(n)', space: 'O(1)' },
      code: CODE_LINEAR
  },
  { 
      id: 'binary', name: 'Binary Search', category: 'Searching', description: 'Repeatedly divides sorted search interval in half.', 
      learnMore: { definition: "Efficient search on SORTED arrays. Halves the search space each step.", howItWorks: ["Check middle", "If target < mid, search left", "If target > mid, search right"], realWorldUses: ["Databases", "Libraries"] },
      complexityDetails: { timeBest: 'Ω(1)', timeAvg: 'Θ(log n)', timeWorst: 'O(log n)', space: 'O(1)' },
      code: CODE_BINARY
  },

  // III. GRAPH
  { 
      id: 'bfs', name: 'Breadth-First Search', category: 'Graph', description: 'Explores neighbor nodes first, before moving to next level neighbors.', 
      learnMore: { definition: "Traverses graph layer by layer using a Queue.", howItWorks: ["Start at root", "Visit all neighbors", "Visit neighbors of neighbors"], realWorldUses: ["Shortest path (unweighted)", "Social networks", "Web crawlers"] },
      complexityDetails: { timeBest: '-', timeAvg: 'O(V+E)', timeWorst: 'O(V+E)', space: 'O(V)' },
      code: CODE_BFS
  },
  { 
      id: 'dfs', name: 'Depth-First Search', category: 'Graph', description: 'Explores as far as possible along each branch before backtracking.', 
      learnMore: { definition: "Traverses graph deep paths first using a Stack/Recursion.", howItWorks: ["Visit node", "Recursively visit unvisited neighbor", "Backtrack if stuck"], realWorldUses: ["Maze solving", "Cycle detection", "Topological sort"] },
      complexityDetails: { timeBest: '-', timeAvg: 'O(V+E)', timeWorst: 'O(V+E)', space: 'O(V)' },
      code: CODE_DFS
  },
  { 
      id: 'dijkstra', name: 'Dijkstra\'s Algo', category: 'Graph', description: 'Finds shortest path in weighted graphs (non-negative weights).', 
      learnMore: { definition: "Greedy algo for shortest paths from source.", howItWorks: ["Init distances to infinity", "Pick min dist node", "Update neighbors", "Repeat"], realWorldUses: ["GPS", "Routing protocols"] },
      complexityDetails: { timeBest: '-', timeAvg: 'O(E log V)', timeWorst: 'O(E log V)', space: 'O(V)' },
      code: CODE_DIJKSTRA
  },
  { 
      id: 'astar', name: 'A* Search', category: 'Graph', description: 'Pathfinding using heuristics (Distance + Estimated Cost).', 
      learnMore: { definition: "Informed search algorithm. Uses f(n) = g(n) + h(n).", howItWorks: ["Like Dijkstra but prioritizes nodes closer to goal (h-score)", "Expands best guess first"], realWorldUses: ["Game AI", "Robot pathfinding"] },
      complexityDetails: { timeBest: '-', timeAvg: 'O(E)', timeWorst: 'O(b^d)', space: 'O(V)' },
      code: CODE_ASTAR
  },
  { 
      id: 'prim', name: 'Prim\'s MST', category: 'Graph', description: 'Finds Minimum Spanning Tree by growing from a starting node.', 
      learnMore: { definition: "Builds MST node by node.", howItWorks: ["Start arbitrary node", "Add cheapest edge to unvisited node", "Repeat"], realWorldUses: ["Network design", "Cable laying"] },
      complexityDetails: { timeBest: '-', timeAvg: 'O(E log V)', timeWorst: 'O(E log V)', space: 'O(V)' },
      code: CODE_PRIM
  },
  { 
      id: 'kruskal', name: 'Kruskal\'s MST', category: 'Graph', description: 'Finds MST by sorting edges and adding if no cycle forms.', 
      learnMore: { definition: "Builds MST edge by edge.", howItWorks: ["Sort all edges", "Add smallest edge if it doesn't form cycle (Union-Find)", "Repeat"], realWorldUses: ["Network design", "Clustering"] },
      complexityDetails: { timeBest: '-', timeAvg: 'O(E log E)', timeWorst: 'O(E log E)', space: 'O(V)' },
      code: CODE_KRUSKAL
  },

  // IV. TREE
  { 
      id: 'preorder', name: 'Pre-Order Traversal', category: 'Tree', description: 'Visit Root -> Left -> Right.', 
      learnMore: { definition: "Depth-first traversal.", howItWorks: ["Process current", "Visit Left", "Visit Right"], realWorldUses: ["Copying trees", "Prefix expression"] },
      complexityDetails: { timeBest: 'O(n)', timeAvg: 'O(n)', timeWorst: 'O(n)', space: 'O(h)' },
      code: CODE_TREE_PRE
  },
  { 
      id: 'inorder', name: 'In-Order Traversal', category: 'Tree', description: 'Visit Left -> Root -> Right.', 
      learnMore: { definition: "Depth-first traversal. Returns sorted values for BST.", howItWorks: ["Visit Left", "Process Current", "Visit Right"], realWorldUses: ["Binary Search Tree sorting"] },
      complexityDetails: { timeBest: 'O(n)', timeAvg: 'O(n)', timeWorst: 'O(n)', space: 'O(h)' },
      code: CODE_TREE_IN
  },
  { 
      id: 'postorder', name: 'Post-Order Traversal', category: 'Tree', description: 'Visit Left -> Right -> Root.', 
      learnMore: { definition: "Depth-first traversal.", howItWorks: ["Visit Left", "Visit Right", "Process Current"], realWorldUses: ["Deleting trees", "Postfix expression"] },
      complexityDetails: { timeBest: 'O(n)', timeAvg: 'O(n)', timeWorst: 'O(n)', space: 'O(h)' },
      code: CODE_TREE_POST
  },
  { 
      id: 'bstsearch', name: 'BST Search', category: 'Tree', description: 'Find value in Binary Search Tree.', 
      learnMore: { definition: "Exploits BST property: Left < Node < Right.", howItWorks: ["Compare with root", "If < go Left", "If > go Right"], realWorldUses: ["Database indexing"] },
      complexityDetails: { timeBest: 'O(1)', timeAvg: 'O(log n)', timeWorst: 'O(n)', space: 'O(1)' },
      code: CODE_BST
  },

  // V. BACKTRACKING
  { 
      id: 'nqueens', name: 'N-Queens', category: 'Backtracking', description: 'Place N queens on NxN board without attacking each other.', 
      learnMore: { definition: "Constraint satisfaction problem.", howItWorks: ["Place Q in col", "Check safety", "Recurse", "Backtrack if stuck"], realWorldUses: ["Scheduling", "Resource allocation"] },
      complexityDetails: { timeBest: '-', timeAvg: 'O(N!)', timeWorst: 'O(N!)', space: 'O(N)' },
      code: CODE_NQUEENS
  },
  { 
      id: 'maze', name: 'Maze Generator', category: 'Backtracking', description: 'Randomized Depth-First Search to carve a maze.', 
      learnMore: { definition: "Generates perfect maze (one path between any points).", howItWorks: ["Mark current visited", "Pick random unvisited neighbor", "Remove wall", "Recurse"], realWorldUses: ["Game levels", "Network routing"] },
      complexityDetails: { timeBest: 'O(N)', timeAvg: 'O(N)', timeWorst: 'O(N)', space: 'O(N)' },
      code: CODE_MAZE
  }
];

// --- STATIC DATA HELPERS ---
const getStaticArray = () => [
    {id:'1', val: 45}, {id:'2', val: 12}, {id:'3', val: 89}, {id:'4', val: 33}, 
    {id:'5', val: 76}, {id:'6', val: 5},  {id:'7', val: 24}, {id:'8', val: 50}
];

const getGraphData = () => {
    const nodes: Node<NodeData>[] = [
        { id: 'A', position: { x: 50, y: 150 }, data: { label: 'A', mode: 'algo-tree', hScore: 10 }, type: 'custom' },
        { id: 'B', position: { x: 200, y: 50 }, data: { label: 'B', mode: 'algo-tree', hScore: 8 }, type: 'custom' },
        { id: 'C', position: { x: 200, y: 250 }, data: { label: 'C', mode: 'algo-tree', hScore: 7 }, type: 'custom' },
        { id: 'D', position: { x: 350, y: 50 }, data: { label: 'D', mode: 'algo-tree', hScore: 5 }, type: 'custom' },
        { id: 'E', position: { x: 350, y: 250 }, data: { label: 'E', mode: 'algo-tree', hScore: 3 }, type: 'custom' },
        { id: 'F', position: { x: 500, y: 150 }, data: { label: 'F', mode: 'algo-tree', hScore: 0 }, type: 'custom' },
    ];
    const edges: Edge[] = [
        { id: 'eAB', source: 'A', target: 'B', label: '4', data: { weight: 4 } },
        { id: 'eAC', source: 'A', target: 'C', label: '2', data: { weight: 2 } },
        { id: 'eBC', source: 'B', target: 'C', label: '1', data: { weight: 1 } },
        { id: 'eBD', source: 'B', target: 'D', label: '5', data: { weight: 5 } },
        { id: 'eCE', source: 'C', target: 'E', label: '8', data: { weight: 8 } },
        { id: 'eCD', source: 'C', target: 'D', label: '10', data: { weight: 10 } },
        { id: 'eDE', source: 'D', target: 'E', label: '2', data: { weight: 2 } },
        { id: 'eDF', source: 'D', target: 'F', label: '6', data: { weight: 6 } },
        { id: 'eEF', source: 'E', target: 'F', label: '3', data: { weight: 3 } },
    ];
    return { nodes, edges };
};

const getTreeData = () => {
     const nodes: Node<NodeData>[] = [
        { id: '50', position: { x: 400, y: 50 }, data: { label: '50', mode: 'algo-tree' }, type: 'custom' },
        { id: '30', position: { x: 250, y: 150 }, data: { label: '30', mode: 'algo-tree' }, type: 'custom' },
        { id: '70', position: { x: 550, y: 150 }, data: { label: '70', mode: 'algo-tree' }, type: 'custom' },
        { id: '20', position: { x: 180, y: 250 }, data: { label: '20', mode: 'algo-tree' }, type: 'custom' },
        { id: '40', position: { x: 320, y: 250 }, data: { label: '40', mode: 'algo-tree' }, type: 'custom' },
        { id: '60', position: { x: 480, y: 250 }, data: { label: '60', mode: 'algo-tree' }, type: 'custom' },
        { id: '80', position: { x: 620, y: 250 }, data: { label: '80', mode: 'algo-tree' }, type: 'custom' },
     ];
     const edges: Edge[] = [
         { id: 'e50-30', source: '50', target: '30' }, { id: 'e50-70', source: '50', target: '70' },
         { id: 'e30-20', source: '30', target: '20' }, { id: 'e30-40', source: '30', target: '40' },
         { id: 'e70-60', source: '70', target: '60' }, { id: 'e70-80', source: '70', target: '80' },
     ];
     return { nodes, edges };
};

// --- CORE GENERATOR ---
export const generateFrames = (algoId: string): AlgoFrame[] => {
    // 1. SORTING
    if (algoId === 'bubble') return genBubbleSort();
    if (algoId === 'selection') return genSelectionSort();
    if (algoId === 'insertion') return genInsertionSort();
    if (algoId === 'quick') return genQuickSort();
    if (algoId === 'merge') return genMergeSort();
    if (algoId === 'heap') return genHeapSort();
    if (algoId === 'radix') return genRadixSort();
    
    // 2. SEARCHING
    if (algoId === 'linear') return genLinearSearch();
    if (algoId === 'binary') return genBinarySearch();

    // 3. GRAPH
    if (algoId === 'bfs') return genBFS();
    if (algoId === 'dfs') return genDFS();
    if (algoId === 'dijkstra') return genDijkstra();
    if (algoId === 'astar') return genAStar();
    if (algoId === 'prim') return genPrim();
    if (algoId === 'kruskal') return genKruskal();

    // 4. TREE
    if (algoId === 'preorder') return genTreeTraversal('pre');
    if (algoId === 'inorder') return genTreeTraversal('in');
    if (algoId === 'postorder') return genTreeTraversal('post');
    if (algoId === 'bstsearch') return genBSTSearch();

    // 5. BACKTRACKING
    if (algoId === 'nqueens') return genNQueens();
    if (algoId === 'maze') return genMaze();

    return [];
};

// --- ALGO LOGIC GENERATORS ---

const genBubbleSort = (): AlgoFrame[] => {
    const arr = getStaticArray();
    const frames: AlgoFrame[] = [];
    const n = arr.length;
    
    for(let i=0; i<n; i++) {
        for(let j=0; j<n-i-1; j++) {
            frames.push({ 
                array: [...arr], highlights: [j, j+1], 
                goal: `Compare ${arr[j].val} and ${arr[j+1].val}`,
                result: arr[j].val > arr[j+1].val ? "Swap needed" : "Order correct",
                description: `Checking index ${j} vs ${j+1}`, visualType: 'array',
                codeLine: 5 
            });
            if(arr[j].val > arr[j+1].val) {
                [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
                frames.push({ 
                    array: [...arr], swaps: [j, j+1], 
                    goal: `Swap ${arr[j+1].val} and ${arr[j].val}`,
                    result: "Swapped!",
                    description: `Swapped larger value to right.`, visualType: 'array',
                    codeLine: 7 
                });
            }
        }
        frames.push({
            array: [...arr], dimmed: Array.from({length: i+1}, (_, k) => n-1-k),
            description: `${arr[n-1-i].val} is now sorted at the end.`, visualType: 'array',
            goal: "Mark end of array", result: "Sorted zone grows",
            codeLine: 3 
        });
    }
    return frames;
};

const genSelectionSort = (): AlgoFrame[] => {
    const arr = getStaticArray();
    const frames: AlgoFrame[] = [];
    const n = arr.length;
    
    for(let i=0; i<n; i++) {
        let minIdx = i;
        frames.push({ array: [...arr], pivots: [i], description: `Start pass ${i}. Assume ${arr[i].val} is min.`, visualType: 'array', goal: `Find min in subarray [${i}..${n-1}]`, result: "Searching...", codeLine: 3 });
        
        for(let j=i+1; j<n; j++) {
            frames.push({ 
                array: [...arr], highlights: [j], pivots: [minIdx], 
                goal: `Compare ${arr[j].val} < ${arr[minIdx].val}?`,
                description: `Scanning...`, visualType: 'array',
                codeLine: 5
            });
            if(arr[j].val < arr[minIdx].val) {
                minIdx = j;
                frames.push({ array: [...arr], pivots: [minIdx], description: `Found new minimum: ${arr[j].val}`, visualType: 'array', result: "New Min Found", goal: "Update Min Index", codeLine: 6 });
            }
        }
        if(minIdx !== i) {
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
            frames.push({ array: [...arr], swaps: [i, minIdx], description: `Swap ${arr[i].val} with ${arr[minIdx].val}`, visualType: 'array', goal: "Move min to front", result: "Swapped", codeLine: 10 });
        }
        frames.push({ array: [...arr], dimmed: Array.from({length: i+1}, (_, k) => k), description: "Left partition sorted.", visualType: 'array', goal: "Advance boundary", result: "Partition Grown" });
    }
    return frames;
};

const genInsertionSort = (): AlgoFrame[] => {
    const arr = getStaticArray();
    const frames: AlgoFrame[] = [];
    const n = arr.length;

    for (let i = 1; i < n; i++) {
        let key = arr[i];
        let j = i - 1;
        frames.push({ array: [...arr], pivots: [i], description: `Take key ${key.val}`, visualType: 'array', goal: `Insert ${key.val} into sorted left side`, codeLine: 2 });

        while (j >= 0 && arr[j].val > key.val) {
            frames.push({ array: [...arr], highlights: [j], pivots: [j+1], description: `${arr[j].val} > ${key.val}, shift right.`, visualType: 'array', result: "Shift Right", codeLine: 5 });
            arr[j + 1] = arr[j];
            j = j - 1;
            frames.push({ array: [...arr], swaps: [j+1, j+2], description: "Shifted.", visualType: 'array', codeLine: 6 });
        }
        arr[j + 1] = key;
        frames.push({ array: [...arr], highlights: [j+1], description: `Inserted ${key.val} at index ${j+1}`, visualType: 'array', result: "Inserted", codeLine: 9 });
    }
    return frames;
};

const genQuickSort = (): AlgoFrame[] => {
    const arr = getStaticArray();
    const frames: AlgoFrame[] = [];
    
    const partition = (low: number, high: number) => {
        const pivot = arr[high];
        let i = low - 1;
        frames.push({ array: [...arr], pivots: [high], highlights: [], description: `Pivot: ${pivot.val}`, visualType: 'array', goal: "Partition around Pivot", codeLine: 9 });
        
        for (let j = low; j < high; j++) {
            frames.push({ array: [...arr], pivots: [high], highlights: [j], description: `Compare ${arr[j].val} < ${pivot.val}`, visualType: 'array', codeLine: 12 });
            if (arr[j].val < pivot.val) {
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
                frames.push({ array: [...arr], pivots: [high], swaps: [i, j], description: `Swap smaller element to left`, visualType: 'array', result: "Move Left", codeLine: 14 });
            }
        }
        [arr[i+1], arr[high]] = [arr[high], arr[i+1]];
        frames.push({ array: [...arr], swaps: [i+1, high], description: "Move pivot to correct position", visualType: 'array', result: "Pivot Sorted", codeLine: 17 });
        return i + 1;
    }

    const sort = (low: number, high: number) => {
        if (low < high) {
            frames.push({ array: [...arr], description: "Recursive Call", visualType: 'array', codeLine: 4 });
            const pi = partition(low, high);
            sort(low, pi - 1);
            sort(pi + 1, high);
        }
    }
    sort(0, arr.length - 1);
    frames.push({ array: [...arr], description: "Array Sorted!", visualType: 'array', result: "Done" });
    return frames;
};

const genMergeSort = (): AlgoFrame[] => {
    let arr = getStaticArray();
    const frames: AlgoFrame[] = [];

    const merge = (left: AlgoItem[], right: AlgoItem[], offset: number) => {
        let sorted: AlgoItem[] = [];
        let i = 0, j = 0;
        
        while (i < left.length && j < right.length) {
            frames.push({ array: [...arr], highlights: [offset+i, offset+left.length+j], description: `Comparing sub-arrays`, visualType: 'array', goal: "Merge smallest", result: "Picking...", codeLine: 9 });
            if (left[i].val < right[j].val) sorted.push(left[i++]);
            else sorted.push(right[j++]);
        }
        return [...sorted, ...left.slice(i), ...right.slice(j)];
    };

    const mergeSort = (a: AlgoItem[], off: number): AlgoItem[] => {
        if (a.length <= 1) return a;
        const mid = Math.floor(a.length / 2);
        
        frames.push({ array: [...arr], pivots: [off+mid], description: `Split at index ${off+mid}`, visualType: 'array', goal: "Divide", result: "Split", codeLine: 4 });

        const left = mergeSort(a.slice(0, mid), off);
        const right = mergeSort(a.slice(mid), off + mid);
        
        const merged = merge(left, right, off);
        for(let k=0; k<merged.length; k++) arr[off+k] = merged[k];
        
        frames.push({ array: [...arr], highlights: Array.from({length: merged.length}, (_, k) => off+k), description: "Merged segment sorted", visualType: 'array', result: "Merged", codeLine: 7 });
        return merged;
    }

    mergeSort(arr, 0);
    return frames;
};

const genHeapSort = (): AlgoFrame[] => {
    const arr = getStaticArray();
    const frames: AlgoFrame[] = [];
    const n = arr.length;

    const heapify = (n: number, i: number) => {
        let largest = i;
        const l = 2 * i + 1;
        const r = 2 * i + 2;

        if (l < n && arr[l].val > arr[largest].val) largest = l;
        if (r < n && arr[r].val > arr[largest].val) largest = r;

        if (largest !== i) {
            frames.push({ array: [...arr], highlights: [i, largest], description: "Heapify: Child larger than root", visualType: 'array', goal: "Maintain Max Heap", result: "Swap Down" });
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            frames.push({ array: [...arr], swaps: [i, largest], description: "Swap to maintain Max Heap", visualType: 'array' });
            heapify(n, largest);
        }
    };

    frames.push({ array: [...arr], description: "Building Max Heap...", visualType: 'array', goal: "Build Heap", codeLine: 4 });
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i);

    for (let i = n - 1; i > 0; i--) {
        frames.push({ array: [...arr], highlights: [0, i], description: "Swap Max (Root) with End", visualType: 'array', goal: "Extract Max", codeLine: 7 });
        [arr[0], arr[i]] = [arr[i], arr[0]];
        frames.push({ array: [...arr], swaps: [0, i], dimmed: [i], description: `${arr[i].val} is sorted`, visualType: 'array', result: "Extracted", codeLine: 8 });
        heapify(i, 0);
    }
    return frames;
};

const genRadixSort = (): AlgoFrame[] => {
    const arr = getStaticArray();
    const frames: AlgoFrame[] = [];
    const maxVal = Math.max(...arr.map(x=>x.val));
    
    for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
        frames.push({ array: [...arr], description: `Sorting by digit place: ${exp}`, visualType: 'array', goal: `Bucket sort by digit ${exp}`, result: "Processing...", codeLine: 4 });
        
        const buckets: AlgoItem[][] = Array.from({length: 10}, () => []);
        
        for (let i = 0; i < arr.length; i++) {
            const digit = Math.floor((arr[i].val / exp) % 10);
            buckets[digit].push(arr[i]);
            frames.push({ 
                array: [...arr], highlights: [i], 
                description: `${arr[i].val} goes to bucket ${digit}`, visualType: 'array',
                result: `Bucket ${digit}` 
            });
        }
        
        let idx = 0;
        for (let b = 0; b < 10; b++) {
            for (let item of buckets[b]) {
                arr[idx++] = item;
            }
        }
        frames.push({ array: [...arr], description: `Re-assembled after digit ${exp}`, visualType: 'array', result: "Partially sorted" });
    }
    return frames;
};

// --- SEARCHING GENERATORS ---
const genLinearSearch = (): AlgoFrame[] => {
    const arr = getStaticArray();
    const target = 76;
    const frames: AlgoFrame[] = [];
    
    frames.push({ array: [...arr], description: `Linear Search for ${target}`, visualType: 'array', goal: `Find ${target}`, codeLine: 2 });
    
    for(let i=0; i<arr.length; i++) {
        frames.push({ array: [...arr], highlights: [i], description: `Checking index ${i}: ${arr[i].val}`, visualType: 'array', codeLine: 3 });
        if(arr[i].val === target) {
             frames.push({ array: [...arr], pivots: [i], description: "Found!", visualType: 'array', result: "Found", codeLine: 3 });
             return frames;
        }
    }
    return frames;
};

const genBinarySearch = (): AlgoFrame[] => {
    const arr = getStaticArray().sort((a,b) => a.val - b.val);
    const target = 76;
    const frames: AlgoFrame[] = [];
    
    let l = 0, r = arr.length - 1;
    frames.push({ array: [...arr], description: `Binary Search for ${target}`, visualType: 'array', goal: `Find ${target} in O(log n)`, codeLine: 4 });
    
    while (l <= r) {
        const mid = Math.floor((l + r) / 2);
        const dimmed = arr.map((_,i) => (i < l || i > r ? i : -1)).filter(x=>x!==-1);
        
        frames.push({ 
            array: [...arr], highlights: [mid], dimmed, pointers: { [l]: 'L', [r]: 'R', [mid]: 'Mid' },
            description: `Check Mid index ${mid}: ${arr[mid].val}`, visualType: 'array', result: arr[mid].val === target ? "Found" : "Checking...",
            codeLine: 5 // Mid calc / check
        });

        if (arr[mid].val === target) {
            frames.push({ array: [...arr], pivots: [mid], description: "Target Found!", visualType: 'array', result: "Found", codeLine: 6 });
            return frames;
        }
        if (arr[mid].val < target) {
            l = mid + 1;
            frames.push({ array: [...arr], description: "Target is larger, search Right", visualType: 'array', codeLine: 7 });
        } else {
            r = mid - 1;
            frames.push({ array: [...arr], description: "Target is smaller, search Left", visualType: 'array', codeLine: 8 });
        }
    }
    return frames;
};

// --- GRAPH GENERATORS ---
const genBFS = (): AlgoFrame[] => {
    const { nodes, edges } = getGraphData();
    const frames: AlgoFrame[] = [];
    const visited = new Set<string>();
    const queue = ['A'];
    visited.add('A');
    
    frames.push({ graphNodes: nodes, graphEdges: edges, visitedNodes: [], currentNode: 'A', visualType: 'graph', description: "Start BFS at A", goal: "Visit all nodes level-by-level", codeLine: 2 });

    while (queue.length > 0) {
        const curr = queue.shift()!;
        frames.push({ graphNodes: nodes, graphEdges: edges, visitedNodes: Array.from(visited), currentNode: curr, visualType: 'graph', description: `Processing ${curr}`, result: "Dequeue", codeLine: 5 });

        const neighbors = edges.filter(e => e.source === curr || e.target === curr);
        for (const e of neighbors) {
            const next = e.source === curr ? e.target : e.source;
            frames.push({ graphNodes: nodes, graphEdges: edges, visitedNodes: Array.from(visited), currentNode: curr, pathEdges: [e.id], visualType: 'graph', description: `Checking neighbor ${next}`, codeLine: 7 });
            
            if (!visited.has(next)) {
                visited.add(next);
                queue.push(next);
                frames.push({ 
                    graphNodes: nodes, graphEdges: edges, visitedNodes: Array.from(visited), 
                    currentNode: curr, pathEdges: [e.id], frontierNodes: queue,
                    visualType: 'graph', description: `Discovered neighbor ${next}`, result: "Enqueue", codeLine: 9 
                });
            }
        }
    }
    frames.push({ graphNodes: nodes, graphEdges: edges, visitedNodes: Array.from(visited), visualType: 'graph', description: "BFS Complete", result: "All reachable nodes visited" });
    return frames;
};

const genDFS = (): AlgoFrame[] => {
    const { nodes, edges } = getGraphData();
    const frames: AlgoFrame[] = [];
    const visited = new Set<string>();
    
    const dfs = (curr: string) => {
        visited.add(curr);
        frames.push({ graphNodes: nodes, graphEdges: edges, visitedNodes: Array.from(visited), currentNode: curr, visualType: 'graph', description: `Visiting ${curr}`, goal: "Go deep", codeLine: 2 });
        
        const neighbors = edges.filter(e => e.source === curr || e.target === curr);
        for (const e of neighbors) {
            const next = e.source === curr ? e.target : e.source;
            frames.push({ graphNodes: nodes, graphEdges: edges, visitedNodes: Array.from(visited), currentNode: curr, pathEdges: [e.id], visualType: 'graph', description: `Checking neighbor ${next}`, codeLine: 4 });
            
            if (!visited.has(next)) {
                frames.push({ graphNodes: nodes, graphEdges: edges, visitedNodes: Array.from(visited), currentNode: curr, pathEdges: [e.id], visualType: 'graph', description: `Exploring edge to ${next}`, result: "Dive", codeLine: 6 });
                dfs(next);
                frames.push({ graphNodes: nodes, graphEdges: edges, visitedNodes: Array.from(visited), currentNode: curr, visualType: 'graph', description: `Backtracking to ${curr}`, result: "Backtrack", codeLine: 3 }); // Approx line for resume
            }
        }
    };
    
    dfs('A');
    return frames;
};

const genDijkstra = (): AlgoFrame[] => {
    const { nodes, edges } = getGraphData();
    const frames: AlgoFrame[] = [];
    const dists: any = { A: 0, B: 99, C: 99, D: 99, E: 99, F: 99 };
    const pq = [{id:'A', d:0}];
    const visited = new Set<string>();
    const parentEdge: any = {};

    frames.push({ graphNodes: nodes, graphEdges: edges, description: "Init distances to infinity, Start to 0", visualType: 'graph', codeLine: 3 });

    while(pq.length > 0) {
        pq.sort((a,b) => a.d - b.d);
        const { id: u, d } = pq.shift()!;
        if(visited.has(u)) continue;
        visited.add(u);

        const nodeState = nodes.map(n => ({...n, data: {...n.data, label: `${n.id} (${dists[n.id]===99?'∞':dists[n.id]})`}}));
        frames.push({ 
            graphNodes: nodeState, graphEdges: edges, visitedNodes: Array.from(visited), 
            pathEdges: Object.values(parentEdge), currentNode: u, visualType: 'graph', 
            description: `Visit ${u}, Dist: ${d}`, goal: "Minimize Distance", codeLine: 7
        });

        edges.filter(e => e.source === u || e.target === u).forEach(e => {
            const v = e.source === u ? e.target : e.source;
            if(!visited.has(v)) {
                const w = e.data.weight;
                if(d + w < dists[v]) {
                    dists[v] = d + w;
                    pq.push({id: v, d: dists[v]});
                    parentEdge[v] = e.id;
                    frames.push({ 
                         graphNodes: nodeState, graphEdges: edges, visitedNodes: Array.from(visited), 
                         pathEdges: Object.values(parentEdge), currentNode: v, visualType: 'graph', 
                         description: `Relax ${v}: New dist ${dists[v]}`, result: "Updated Distance",
                         codeLine: 12
                    });
                }
            }
        });
    }
    return frames;
};

const genAStar = (): AlgoFrame[] => {
    const { nodes, edges } = getGraphData();
    const frames: AlgoFrame[] = [];
    const gScore: any = { A: 0, B: 99, C: 99, D: 99, E: 99, F: 99 };
    const fScore: any = { A: 10, B: 99, C: 99, D: 99, E: 99, F: 99 }; // A.h=10
    const pq = [{id:'A', f:10}];
    const visited = new Set<string>();
    const parentEdge: any = {};

    frames.push({ graphNodes: nodes, graphEdges: edges, description: "Start A*. f(n) = g(n) + h(n)", visualType: 'graph', goal: "Find path to F using Heuristic", codeLine: 3 });

    while(pq.length > 0) {
        pq.sort((a,b) => a.f - b.f);
        const { id: u } = pq.shift()!;
        if(u === 'F') {
             frames.push({ graphNodes: nodes, graphEdges: edges, visitedNodes: Array.from(visited), pathEdges: Object.values(parentEdge), visualType: 'graph', description: "Found Target F!", result: "Goal Reached", codeLine: 8 });
             break;
        }
        visited.add(u);

        const nodeState = nodes.map(n => ({...n, data: {...n.data, label: `${n.id} (f:${fScore[n.id]===99?'∞':fScore[n.id]})`}}));
        frames.push({ graphNodes: nodeState, graphEdges: edges, visitedNodes: Array.from(visited), pathEdges: Object.values(parentEdge), currentNode: u, visualType: 'graph', description: `Expand ${u}`, codeLine: 7 });

        edges.filter(e => e.source === u || e.target === u).forEach(e => {
            const v = e.source === u ? e.target : e.source;
            if(!visited.has(v)) {
                const w = e.data.weight;
                const tentativeG = gScore[u] + w;
                if(tentativeG < gScore[v]) {
                    const vNode = nodes.find(n => n.id === v)!;
                    gScore[v] = tentativeG;
                    fScore[v] = gScore[v] + (vNode.data.hScore || 0);
                    pq.push({id: v, f: fScore[v]});
                    parentEdge[v] = e.id;
                    frames.push({ 
                         graphNodes: nodeState, graphEdges: edges, visitedNodes: Array.from(visited), 
                         pathEdges: Object.values(parentEdge), currentNode: v, visualType: 'graph', 
                         description: `Update ${v}: g=${gScore[v]}, h=${vNode.data.hScore}, f=${fScore[v]}`, result: "Better Path",
                         codeLine: 13 
                    });
                }
            }
        });
    }
    return frames;
};

const genPrim = (): AlgoFrame[] => {
    const { nodes, edges } = getGraphData();
    const frames: AlgoFrame[] = [];
    const visited = new Set(['A']);
    const mstEdges: string[] = [];
    
    while(visited.size < nodes.length) {
         let minEdge = null;
         let minW = 999;
         let nextNode = '';
         
         frames.push({ graphNodes: nodes, graphEdges: edges, visitedNodes: Array.from(visited), pathEdges: mstEdges, description: "Finding minimum edge from visited set...", codeLine: 8 });

         edges.forEach(e => {
             const uVis = visited.has(e.source);
             const vVis = visited.has(e.target);
             if (uVis !== vVis) { 
                 if(e.data.weight < minW) {
                     minW = e.data.weight;
                     minEdge = e;
                     nextNode = uVis ? e.target : e.source;
                 }
             }
         });
         
         if(minEdge) {
             visited.add(nextNode);
             mstEdges.push((minEdge as any).id);
             frames.push({ 
                 graphNodes: nodes, graphEdges: edges, visitedNodes: Array.from(visited), 
                 pathEdges: mstEdges, currentNode: nextNode, visualType: 'graph', 
                 description: `Prim's: Added ${nextNode} via edge (w:${minW})`, goal: "Build MST", result: "Edge Added",
                 codeLine: 11
             });
         } else break;
    }
    return frames;
};

const genKruskal = (): AlgoFrame[] => {
    const { nodes, edges } = getGraphData();
    const frames: AlgoFrame[] = [];
    const sortedEdges = [...edges].sort((a,b) => a.data.weight - b.data.weight);
    const mstEdges: string[] = [];
    const parent: any = {};
    nodes.forEach(n => parent[n.id] = n.id);
    
    const find = (i: string): string => {
        if(parent[i] === i) return i;
        return find(parent[i]);
    };
    const union = (i: string, j: string) => {
        const rootI = find(i);
        const rootJ = find(j);
        if(rootI !== rootJ) parent[rootI] = rootJ;
    };

    frames.push({ graphNodes: nodes, graphEdges: edges, visualType: 'graph', description: "Sort all edges by weight", goal: "Add edges without cycles", codeLine: 4 });

    for(const e of sortedEdges) {
        const rootU = find(e.source);
        const rootV = find(e.target);
        
        frames.push({ 
            graphNodes: nodes, graphEdges: edges, pathEdges: mstEdges, 
            currentNode: e.source, visualType: 'graph', 
            description: `Check edge ${e.source}-${e.target} (w:${e.data.weight})`,
            codeLine: 10
        });

        if(rootU !== rootV) {
            union(e.source, e.target);
            mstEdges.push(e.id);
            frames.push({ 
                graphNodes: nodes, graphEdges: edges, pathEdges: mstEdges, 
                visualType: 'graph', description: "No cycle. Added to MST.", result: "Added",
                codeLine: 15
            });
        } else {
            frames.push({ 
                graphNodes: nodes, graphEdges: edges, pathEdges: mstEdges, 
                visualType: 'graph', description: "Cycle detected. Skip.", result: "Skipped" 
            });
        }
    }
    return frames;
};

// --- TREE GENERATORS ---
const genTreeTraversal = (type: 'pre' | 'in' | 'post'): AlgoFrame[] => {
    const { nodes, edges } = getTreeData();
    const frames: AlgoFrame[] = [];
    const visited: string[] = [];
    
    const traverse = (nodeId: string) => {
        // Find children
        const childEdges = edges.filter(e => e.source === nodeId);
        const left = childEdges.find(e => parseInt(e.target) < parseInt(nodeId))?.target;
        const right = childEdges.find(e => parseInt(e.target) > parseInt(nodeId))?.target;
        
        if (type === 'pre') {
             visited.push(nodeId);
             frames.push({ graphNodes: nodes, graphEdges: edges, visitedNodes: [...visited], currentNode: nodeId, visualType: 'tree', description: `Visit Root ${nodeId}`, goal: "Root -> Left -> Right", codeLine: 3 });
             if(left) traverse(left);
             if(right) traverse(right);
        }
        else if (type === 'in') {
             if(left) traverse(left);
             visited.push(nodeId);
             frames.push({ graphNodes: nodes, graphEdges: edges, visitedNodes: [...visited], currentNode: nodeId, visualType: 'tree', description: `Visit Node ${nodeId}`, goal: "Left -> Root -> Right", codeLine: 3 });
             if(right) traverse(right);
        }
        else if (type === 'post') {
             if(left) traverse(left);
             if(right) traverse(right);
             visited.push(nodeId);
             frames.push({ graphNodes: nodes, graphEdges: edges, visitedNodes: [...visited], currentNode: nodeId, visualType: 'tree', description: `Visit Node ${nodeId}`, goal: "Left -> Right -> Root", codeLine: 4 });
        }
    };
    traverse('50');
    return frames;
};

const genBSTSearch = (): AlgoFrame[] => {
    const { nodes, edges } = getTreeData();
    const frames: AlgoFrame[] = [];
    const target = '40';
    let curr: string | undefined = '50';
    const path: string[] = [];

    frames.push({ graphNodes: nodes, graphEdges: edges, visualType: 'tree', description: `Search for ${target}`, goal: `Find value ${target}`, codeLine: 2 });

    while(curr) {
        path.push(curr);
        frames.push({ graphNodes: nodes, graphEdges: edges, visitedNodes: [...path], currentNode: curr, visualType: 'tree', description: `Checking ${curr}`, codeLine: 2 });
        
        if(curr === target) {
            frames.push({ graphNodes: nodes, graphEdges: edges, visitedNodes: [...path], currentNode: curr, visualType: 'tree', description: "Found!", result: "Found", codeLine: 3 });
            break;
        }
        
        const val = parseInt(curr);
        const tVal = parseInt(target);
        
        const childEdges = edges.filter(e => e.source === curr);
        if(tVal < val) {
             curr = childEdges.find(e => parseInt(e.target) < val)?.target;
             if(curr) frames.push({ graphNodes: nodes, graphEdges: edges, visitedNodes: [...path], visualType: 'tree', description: `${tVal} < ${val}, go Left`, result: "Go Left", codeLine: 6 });
        } else {
             curr = childEdges.find(e => parseInt(e.target) > val)?.target;
             if(curr) frames.push({ graphNodes: nodes, graphEdges: edges, visitedNodes: [...path], visualType: 'tree', description: `${tVal} > ${val}, go Right`, result: "Go Right", codeLine: 5 });
        }
    }
    return frames;
};

// --- BACKTRACKING ---
const genNQueens = (): AlgoFrame[] => {
    const N = 4;
    const frames: AlgoFrame[] = [];
    const board = Array(N).fill(0).map(() => Array(N).fill(0));

    const createBoard = (hlRow = -1, hlCol = -1, isSafe = true) => {
        return board.map((row, r) => row.map((val, c) => ({
            row: r, col: c, val: val === 1 ? 'Q' : '',
            isHighlight: r === hlRow && c === hlCol,
            isActive: val === 1,
            isTarget: !isSafe && r === hlRow && c === hlCol 
        })));
    };

    const isSafe = (row: number, col: number) => {
        for(let i=0; i<col; i++) if(board[row][i]) return false;
        for(let i=row, j=col; i>=0 && j>=0; i--, j--) if(board[i][j]) return false;
        for(let i=row, j=col; i<N && j>=0; i++, j--) if(board[i][j]) return false;
        return true;
    };

    const solve = (col: number) => {
        if (col >= N) return true;

        for (let i = 0; i < N; i++) {
            frames.push({ grid: createBoard(i, col), visualType: 'board', description: `Try placing Queen at (${i}, ${col}).`, goal: "Place Queen Safely", codeLine: 3 });

            if (isSafe(i, col)) {
                board[i][col] = 1;
                frames.push({ grid: createBoard(i, col, true), visualType: 'board', description: `Safe! Place Queen.`, result: "Placed", codeLine: 5 });

                if (solve(col + 1)) return true;

                board[i][col] = 0; // Backtrack
                frames.push({ grid: createBoard(i, col), visualType: 'board', description: `Backtrack: Remove Queen from (${i}, ${col}).`, result: "Backtrack", codeLine: 7 });
            } else {
                frames.push({ grid: createBoard(i, col, false), visualType: 'board', description: `Unsafe! Queen attacked.`, result: "Conflict", codeLine: 4 });
            }
        }
        return false;
    };

    solve(0);
    frames.push({ grid: createBoard(), visualType: 'board', description: "Solution Found!", result: "Solved" });
    return frames;
};

const genMaze = (): AlgoFrame[] => {
    const N = 5;
    const frames: AlgoFrame[] = [];
    const maze = Array(N).fill(0).map(() => Array(N).fill(1)); // 1=Wall, 0=Path
    
    // Start 0,0
    const dirs = [[0,1], [1,0], [0,-1], [-1,0]];
    const stack: number[][] = [];
    
    const createGrid = (currR: number, currC: number) => {
         return maze.map((row, r) => row.map((val, c) => ({
             row: r, col: c, val: '',
             isWall: val === 1,
             isActive: r === currR && c === currC, // Head
             isHighlight: val === 0 // Path
         })));
    };

    const carve = (r: number, c: number) => {
        maze[r][c] = 0;
        stack.push([r,c]);
        frames.push({ grid: createGrid(r,c), visualType: 'grid', description: `Visit (${r},${c})`, goal: "Visit all cells", codeLine: 2 });

        // Shuffle directions
        const shuffledDirs = [...dirs].sort(() => Math.random() - 0.5);
        
        for(const [dr, dc] of shuffledDirs) {
            const nr = r + dr*2, nc = c + dc*2;
            if(nr >= 0 && nr < N && nc >= 0 && nc < N && maze[nr][nc] === 1) {
                maze[r+dr][c+dc] = 0; // Carve wall between
                frames.push({ grid: createGrid(r+dr, c+dc), visualType: 'grid', description: `Carving path...`, codeLine: 6 });
                carve(nr, nc);
                frames.push({ grid: createGrid(r,c), visualType: 'grid', description: `Back at (${r},${c})`, result: "Backtrack" });
            }
        }
    };

    carve(0,0);
    frames.push({ grid: createGrid(0,0), visualType: 'grid', description: "Maze Generated", result: "Done" });
    return frames;
};