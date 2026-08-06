import { z } from 'zod';

export const appSettingsSchema = z.object({
  themeMode: z.enum(['system', 'light', 'dark']),
});

export type AppSettings = z.infer<typeof appSettingsSchema>;
