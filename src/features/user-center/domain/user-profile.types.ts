import { z } from 'zod';

export const userProfileSchema = z.object({
  userId: z.string(),
  phoneNumber: z.string().optional().nullable(),
  maskedPhoneNumber: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

export const userProfileUpdateSchema = z.object({
  name: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
});

export type UserProfileUpdate = z.infer<typeof userProfileUpdateSchema>;
