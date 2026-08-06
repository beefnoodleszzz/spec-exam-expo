import { z } from 'zod';

export const userProfileResponseSchema = z.object({
  id: z.number().optional().nullable(),
  username: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  // Add other required fields corresponding to ExaminationManageContractDtoUserAppUserDto
}).transform(data => ({
  userId: data.id?.toString() || '',
  name: data.username,
  phoneNumber: data.phone,
  avatar: data.avatar,
}));

export const learningSummaryResponseSchema = z.object({
  subjectCount: z.number().optional().nullable().default(0),
  rightCount: z.number().optional().nullable().default(0),
  accuracy: z.number().optional().nullable().default(0),
  timeCount: z.number().optional().nullable().default(0),
}).transform(data => ({
  totalQuestionsCount: data.subjectCount ?? 0,
  correctQuestionsCount: data.rightCount ?? 0,
  accuracy: data.accuracy ?? 0,
  totalDurationSeconds: data.timeCount ?? 0,
}));
