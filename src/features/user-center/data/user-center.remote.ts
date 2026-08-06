import type { UserProfile, UserProfileUpdate } from '../domain/user-profile.types';
import type { LearningSummary } from '../domain/learning-summary.types';

export interface IUserCenterRemote {
  getUserProfile(): Promise<UserProfile>;
  getLearningSummary(examTypeId: string): Promise<LearningSummary>;
  updateUserProfile(params: UserProfileUpdate): Promise<UserProfile>;
  submitFeedback(content: string): Promise<void>;
}
