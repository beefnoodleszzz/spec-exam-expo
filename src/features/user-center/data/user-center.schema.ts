import { z } from 'zod';

export const userProfileResponseSchema = z.object({
  id: z.string({ required_error: 'id is required' }),
  nickName: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  img: z.string().optional().nullable(),
}).transform(data => {
  const phone = data.mobile || '';
  const maskedPhone = phone.length >= 11 ? `${phone.substring(0, 3)}****${phone.substring(7)}` : phone;

  return {
    userId: data.id,
    name: data.nickName,
    phoneNumber: data.mobile,
    maskedPhoneNumber: maskedPhone,
    avatar: data.img,
  };
});

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
