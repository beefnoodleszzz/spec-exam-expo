import { z } from 'zod';

export const userProfileSchema = z.object({
  userId: z.string(),
  phoneNumber: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  // Add other necessary fields based on the API response
});

export type UserProfile = z.infer<typeof userProfileSchema>;

export const userProfileUpdateSchema = z.object({
  name: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
});

export type UserProfileUpdate = z.infer<typeof userProfileUpdateSchema>;
