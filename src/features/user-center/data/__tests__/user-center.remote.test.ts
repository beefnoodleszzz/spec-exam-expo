import { describe, it, expect, vi } from 'vitest';
import { UserCenterRemote } from '../user-center.remote';
import { extractGeneratedData } from '@/shared/api/generated-response';

vi.mock('@/shared/api/generated-response', () => ({
  extractGeneratedData: vi.fn(),
}));

vi.mock('@/shared/api/generated/endpoints/examination-manager-v2/examination-manager-v2', () => ({
  apiExamV2AppUserDetailGet: vi.fn().mockResolvedValue({}),
  apiExamV2AppUserUserDataDetailGet: vi.fn().mockResolvedValue({}),
  apiExamV2AppUserUpdateUserPost: vi.fn().mockResolvedValue({}),
  apiExamV2AppInsertFeedBackPost: vi.fn().mockResolvedValue({}),
  apiExamV2AppUserDeleteUserGet: vi.fn().mockResolvedValue({}),
}));

describe('UserCenterRemote', () => {
  it('should get user profile', async () => {
    const remote = new UserCenterRemote();
    vi.mocked(extractGeneratedData).mockReturnValue({
      id: 1,
      username: 'Test User',
      phone: '1234567890',
    });

    const profile = await remote.getUserProfile();
    expect(profile.name).toBe('Test User');
    expect(profile.phoneNumber).toBe('1234567890');
  });
});
