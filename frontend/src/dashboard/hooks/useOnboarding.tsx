import { useMutation, useQuery } from "@tanstack/react-query";
import { apiService, OnboardingData, OnboardingResponse } from "@/services/api";

export const useGetOnboardingStatus = (enabled: boolean = true) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['onboarding'],
    enabled,
    queryFn: async (): Promise<OnboardingResponse> => {
      const response = await apiService.getOnboarding();
      return response.data ?? {
        onboarding_data: undefined,
        is_completed: false,
        message: ""
      };
    },
    select: (response: OnboardingResponse) => {
      return response
    },
  })

  return { data, isLoading, error, refetch }
};

export const useUpdateOnboarding = () => {
  const { mutate, isPending, error } = useMutation({
    mutationFn: async (onboardingData: OnboardingData) => {
      const response = await apiService.updateOnboarding(onboardingData);
      return response;
    },
  })

  return { updateOnboarding: mutate, isPending, error }
}