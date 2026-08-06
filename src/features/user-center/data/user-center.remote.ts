import {
  apiExamV2AppUserDetailGet,
  apiExamV2AppUserUserDataDetailGet,
  apiExamV2AppUserUpdateUserPost,
  apiExamV2AppInsertFeedBackPost,
  apiExamV2AppUserDeleteUserGet
} from '@/shared/api/generated/endpoints/examination-manager-v2/examination-manager-v2';
import { userProfileResponseSchema, learningSummaryResponseSchema } from './user-center.schema';
import { extractGeneratedData } from '@/shared/api/generated-response';
import type { UserProfile, UserProfileUpdate } from '../domain/user-profile.types';
import type { LearningSummary } from '../domain/learning-summary.types';

export class UserCenterRemote {
  async getUserProfile(): Promise<UserProfile> {
    const response = await apiExamV2AppUserDetailGet();
    const data = extractGeneratedData(response, 'getUserProfile');
    return userProfileResponseSchema.parse(data);
  }

  async getLearningSummary(): Promise<LearningSummary> {
    const response = await apiExamV2AppUserUserDataDetailGet();
    const data = extractGeneratedData(response, 'getLearningSummary');
    return learningSummaryResponseSchema.parse(data);
  }

  async updateUserProfile(params: UserProfileUpdate): Promise<void> {
    const response = await apiExamV2AppUserUpdateUserPost({
      ...(params.name ? { nickName: params.name } : {}),
      ...(params.avatar ? { img: params.avatar } : {}),
    });
    extractGeneratedData(response, 'updateUserProfile');
  }

  async submitFeedback(content: string): Promise<void> {
    const response = await apiExamV2AppInsertFeedBackPost({
      content,
    });
    extractGeneratedData(response, 'submitFeedback');
  }

  async deleteAccount(): Promise<void> {
    const response = await apiExamV2AppUserDeleteUserGet();
    extractGeneratedData(response, 'deleteAccount');
  }
}
