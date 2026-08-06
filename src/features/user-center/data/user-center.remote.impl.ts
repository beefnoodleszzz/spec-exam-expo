import {
  apiExamV2AppUserDetailGet,
  apiExamV2AppUserUserDataDetailGet,
  apiExamV2AppUserUpdateUserPost,
  apiExamV2AppInsertFeedBackPost
} from '@/shared/api/generated/endpoints/examination-manager-v2/examination-manager-v2';
import { userProfileResponseSchema, learningSummaryResponseSchema } from './user-center.schema';
import { extractGeneratedData } from '@/shared/api/generated-response';
import type { UserProfile, UserProfileUpdate } from '../domain/user-profile.types';
import type { LearningSummary } from '../domain/learning-summary.types';
import type { IUserCenterRemote } from './user-center.remote';
import { appStore } from '@/shared/auth/app-store';
import { createContractError } from '@/shared/api/errors/app-error';

function assertCurrentExamType(examTypeId: string): void {
  const current = appStore.getState().currentExamProfile?.examTypeId;
  if (current !== examTypeId) {
    throw createContractError('当前请求的考试类型与全局上下文不一致');
  }
}


export class UserCenterRemoteImpl implements IUserCenterRemote {
  async getUserProfile(): Promise<UserProfile> {
    const response = await apiExamV2AppUserDetailGet();
    const data = extractGeneratedData(response.data, 'getUserProfile');
    return userProfileResponseSchema.parse(data);
  }

  async getLearningSummary(examTypeId: string): Promise<LearningSummary> {
    assertCurrentExamType(examTypeId);
    const response = await apiExamV2AppUserUserDataDetailGet(); // relies on global examTypeId header injection
    const data = extractGeneratedData(response.data, 'getLearningSummary');
    return learningSummaryResponseSchema.parse(data);
  }

  async updateUserProfile(params: UserProfileUpdate): Promise<UserProfile> {
    const response = await apiExamV2AppUserUpdateUserPost({
      ...(params.name ? { nickName: params.name } : {}),
      ...(params.avatar ? { img: params.avatar } : {}),
    });
    extractGeneratedData(response.data, 'updateUserProfile');
    return this.getUserProfile();
  }

  async submitFeedback(content: string): Promise<void> {
    const response = await apiExamV2AppInsertFeedBackPost({
      content,
    });
    extractGeneratedData(response.data, 'submitFeedback');
  }


}
