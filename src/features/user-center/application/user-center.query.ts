import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserCenterRemote } from '../data/user-center.remote';
import type { UserProfileUpdate } from '../domain/user-profile.types';

const remote = new UserCenterRemote();

export const userCenterKeys = {
  all: ['user-center'] as const,
  profile: () => [...userCenterKeys.all, 'profile'] as const,
  learningSummary: () => [...userCenterKeys.all, 'learningSummary'] as const,
};

export function useUserProfile() {
  return useQuery({
    queryKey: userCenterKeys.profile(),
    queryFn: () => remote.getUserProfile(),
  });
}

export function useLearningSummary() {
  return useQuery({
    queryKey: userCenterKeys.learningSummary(),
    queryFn: () => remote.getLearningSummary(),
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserProfileUpdate) => remote.updateUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userCenterKeys.profile() });
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
