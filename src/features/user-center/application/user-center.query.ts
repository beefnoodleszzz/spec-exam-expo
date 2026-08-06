import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userCenterRemote as remote } from '../data/user-center.container';
import type { UserProfileUpdate } from '../domain/user-profile.types';

export const userCenterKeys = {
  all: ['user-center'] as const,
  profile: () => [...userCenterKeys.all, 'profile'] as const,
  learningSummary: (examTypeId: string) => [...userCenterKeys.all, 'learningSummary', examTypeId] as const,
};

export function useUserProfile() {
  return useQuery({
    queryKey: userCenterKeys.profile(),
    queryFn: () => remote.getUserProfile(),
  });
}

export function useLearningSummary(examTypeId: string) {
  return useQuery({
    queryKey: userCenterKeys.learningSummary(examTypeId),
    queryFn: () => remote.getLearningSummary(examTypeId),
    enabled: !!examTypeId,
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserProfileUpdate) => remote.updateUserProfile(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(userCenterKeys.profile(), updatedProfile);
      
      // Update global auth user store asynchronously to avoid cyclical strict dependencies
      import('@/features/auth/state/auth-user.store').then(module => {
        const store = module.useAuthUserStore.getState();
        if (store.user) {
          store.setUser({
            ...store.user,
            nickname: updatedProfile.name ?? store.user.nickname,
            avatarUrl: updatedProfile.avatar ?? store.user.avatarUrl,
          });
        }
      }).catch(() => {});
    },
  });
}

export function useSubmitFeedback() {
  return useMutation({
    mutationFn: (content: string) => remote.submitFeedback(content),
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => remote.deleteAccount(),
  });
}
