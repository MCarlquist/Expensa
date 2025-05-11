'use server';
/**
 * @fileOverview Currency conversion AI agent.
 *
 * - convertCurrency - A function that handles currency conversion.
 * - ConvertCurrencyInput - The input type for the convertCurrency function.
 * - ConvertCurrencyOutput - The return type for the convertCurrency function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConvertCurrencyInputSchema = z.object({
  amount: z.number().describe('The amount to convert.'),
  fromCurrency: z.string().describe('The currency code to convert from (e.g., USD, EUR).'),
  toCurrency: z.string().describe('The currency code to convert to (e.g., SEK).'),
});
export type ConvertCurrencyInput = z.infer<typeof ConvertCurrencyInputSchema>;

const ConvertCurrencyOutputSchema = z.object({
  convertedAmount: z.number().describe('The converted amount in the target currency.'),
});
export type ConvertCurrencyOutput = z.infer<typeof ConvertCurrencyOutputSchema>;

export async function convertCurrency(input: ConvertCurrencyInput): Promise<ConvertCurrencyOutput> {
  if (input.fromCurrency.toUpperCase() === input.toCurrency.toUpperCase()) {
    return { convertedAmount: input.amount };
  }
  return convertCurrencyFlow(input);
}

const convertCurrencyPrompt = ai.definePrompt({
  name: 'convertCurrencyPrompt',
  input: {schema: ConvertCurrencyInputSchema},
  output: {schema: ConvertCurrencyOutputSchema},
  prompt: `You are an expert currency converter. Convert {amount} {fromCurrency} to {toCurrency} using reliable and up-to-date exchange rates.
Utilize data from a reliable financial data provider or API to ensure accuracy in the conversion.

Provide only the numerical converted amount as a float (e.g., 105.32), without any currency symbols, thousand separators, or additional text.
If {fromCurrency} is already {toCurrency}, return {amount}.`,
  config: {
    responseMimeType: "application/json", // Helps ensure JSON output for Zod schema parsing
  }
});

const convertCurrencyFlow = ai.defineFlow(
  {
    name: 'convertCurrencyFlow',
    inputSchema: ConvertCurrencyInputSchema,
    outputSchema: ConvertCurrencyOutputSchema,
  },
  async (input: ConvertCurrencyInput) => {
    if (input.fromCurrency.toUpperCase() === input.toCurrency.toUpperCase()) {
      return { convertedAmount: input.amount };
    }
    const {output} = await convertCurrencyPrompt(input);
    if (output === null || output === undefined) {
        throw new Error("Currency conversion failed to produce an output.");
    }
    // The Zod schema on the prompt output should handle parsing to a number
    return output;
  }
);
