import { z } from 'zod';

export const learningSummarySchema = z.object({
  totalQuestionsCount: z.number(),
  correctQuestionsCount: z.number(),
  accuracy: z.number(),
  totalDurationSeconds: z.number(),
  // Add other necessary fields based on the API response
});

export type LearningSummary = z.infer<typeof learningSummarySchema>;
