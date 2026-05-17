/**
 * @file services/openRouterService.ts
 * @description Provides the list of available OpenRouter AI models.
 *              Currently returns a single hardcoded free-tier model
 *              (DeepSeek R1 Chimera) to ensure consistent behavior
 *              without requiring a paid API key.
 */

import { OpenRouterModel } from '../types';

/**
 * Returns the list of supported OpenRouter models.
 *
 * NOTE: This is intentionally hardcoded to a single free model to avoid
 * UI clutter and ensure new users can get started without cost. If you
 * want to support model selection from the full OpenRouter catalog,
 * replace this with a fetch to `https://openrouter.ai/api/v1/models`.
 *
 * @returns Array of OpenRouterModel metadata objects
 */
export const fetchOpenRouterModels = async (): Promise<OpenRouterModel[]> => {
  return [
    {
        id: 'tngtech/deepseek-r1t2-chimera:free',
        name: 'DeepSeek R1 Chimera (Free)',
        description: 'DeepSeek R1 Distill Llama 70B (Free via TNGTech)',
        pricing: { prompt: '0', completion: '0' },
        context_length: 8192,
        architecture: {
            modality: 'text',
            tokenizer: 'llama'
        }
    }
  ];
};