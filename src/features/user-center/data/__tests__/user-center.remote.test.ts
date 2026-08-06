import { describe, it, expect, vi } from 'vitest';
import { UserCenterRemoteImpl } from '../user-center.remote.impl';
import { extractGeneratedData } from '@/shared/api/generated-response';
import { apiExamV2AppUserDetailGet, apiExamV2AppUserUserDataDetailGet } from '@/shared/api/generated/endpoints/examination-manager-v2/examination-manager-v2';
import { appStore } from '@/shared/auth/app-store';

vi.mock('@/shared/api/generated-response', () => ({
  extractGeneratedData: vi.fn(),
}));

vi.mock('@/shared/api/generated/endpoints/examination-manager-v2/examination-manager-v2', () => ({
  apiExamV2AppUserDetailGet: vi.fn().mockResolvedValue({ data: {} }),
  apiExamV2AppUserUserDataDetailGet: vi.fn().mockResolvedValue({ data: {} }),
  apiExamV2AppUserUpdateUserPost: vi.fn().mockResolvedValue({ data: {} }),
  apiExamV2AppInsertFeedBackPost: vi.fn().mockResolvedValue({ data: {} }),
  apiExamV2AppUserDeleteUserGet: vi.fn().mockResolvedValue({ data: {} }),
}));

describe('UserCenterRemoteImpl', () => {
  it('should get user profile', async () => {
    const remote = new UserCenterRemoteImpl();
    vi.mocked(extractGeneratedData).mockReturnValue({
      id: '1',
      nickName: 'Test User',
      mobile: '12345678901',
    });

    const profile = await remote.getUserProfile();
    expect(profile.name).toBe('Test User');
    expect(profile.phoneNumber).toBe('12345678901');
    expect(profile.maskedPhoneNumber).toBe('123****8901');
    expect(apiExamV2AppUserDetailGet).toHaveBeenCalled();
    expect(extractGeneratedData).toHaveBeenCalledWith({}, 'getUserProfile');
  });

  it('should throw contract error if examTypeId does not match context', async () => {
    const remote = new UserCenterRemoteImpl();
    appStore.setState({ currentExamProfile: { examTypeId: 'typeA' } } as never);
    await expect(remote.getLearningSummary('typeB')).rejects.toMatchObject({ type: 'contract' });
  });

  it('should get learning summary if examTypeId matches', async () => {
    const remote = new UserCenterRemoteImpl();
    appStore.setState({ currentExamProfile: { examTypeId: 'typeA' } } as never);
    vi.mocked(extractGeneratedData).mockReturnValue({
      subjectCount: 100,
      rightCount: 40,
      accuracy: 50,
      timeCount: 300,
    });
    const summary = await remote.getLearningSummary('typeA');
    expect(summary.totalQuestionsCount).toBe(100);
    expect(summary.accuracy).toBe(50);
    expect(summary.correctQuestionsCount).toBe(40);
    expect(apiExamV2AppUserUserDataDetailGet).toHaveBeenCalled();
  });
});
