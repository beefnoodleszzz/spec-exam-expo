import { describe, it, expect, vi } from 'vitest';
import { clearAuthenticatedState } from '../../auth.container';
import { sessionStore } from '@/shared/auth/session-store';
import { useAuthUserStore } from '../auth-user.store';
import { appStore } from '@/shared/auth/app-store';
import { queryClient } from '@/shared/query/query-client';

vi.mock('@/shared/query/query-client', () => ({
  queryClient: { clear: vi.fn() },
}));

vi.mock('@/shared/persistence/secure-storage', () => ({
  clearSecureCredentials: vi.fn(),
  setSecure: vi.fn(),
  SecureKeys: {},
}));

vi.mock('@/shared/persistence/async-storage', () => ({
  clearUserAsyncData: vi.fn(),
  removeAsync: vi.fn(),
  setAsync: vi.fn(),
  getAsync: vi.fn(),
  AsyncKeys: {},
}));

describe('authenticated state cleanup', () => {
  it('clears session, auth user, exam profile, query cache on logout', async () => {
    sessionStore.setState({ status: 'authenticated', accessToken: 'token', userId: '1' });
    useAuthUserStore.getState().setUser({ id: '1', nickname: 'user', avatarUrl: null, phone: '111' });
    appStore.getState().setExamProfile({ examTypeId: '1', examTypeName: 'Test' } as never);

    await clearAuthenticatedState();

    expect(sessionStore.getState().status).toBe('anonymous');
    expect(sessionStore.getState().accessToken).toBeNull();
    expect(useAuthUserStore.getState().user).toBeNull();
    expect(appStore.getState().currentExamProfile).toBeNull();
    expect(queryClient.clear).toHaveBeenCalled();
  });
});
