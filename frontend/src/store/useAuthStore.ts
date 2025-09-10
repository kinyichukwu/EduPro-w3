import { create } from "zustand";
import { supabase } from "../lib/supabaseClient";
import { persist } from "zustand/middleware";
import { apiService, type OnboardingData as ApiOnboardingData } from "../services/api";
import { AuthChangeEvent, Provider, Session } from "@supabase/supabase-js";

interface OnboardingData {
  role: string;
  customLearningGoal?: string;
  academicDetails?: {
    // JAMB details
    preferredUniversity?: string;
    preferredCourse?: string;
    targetScore?: string;
    jambYear?: string;
    jambSubjects?: string[];
    // University details
    university?: string;
    course?: string;
    level?: string;
    matricNumber?: string;
    // Lecturer details
    experience?: string;
    title?: string;
    // Custom learning details
    educationLevel?: string;
    experienceLevel?: string;
    additionalDetails?: string;
  };
  completedAt?: Date;
}

interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar?: string;
  onboardingData?: OnboardingData;
  access_token?: string;
}

interface LoadingStates {
  signIn: boolean;
  signUp: boolean;
  googleOAuth: boolean;
  appleOAuth: boolean;
  signOut: boolean;
  fetchUser: boolean;
  updateOnboarding: boolean
}

interface AuthState {
  user: User | null;
  loading: LoadingStates;
  error: string | null;
  signIn: (
    email: string,
    password: string,
    onSuccess?: () => void
  ) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    username: string,
    onSuccess?: () => void
  ) => Promise<void>;
  signInWithOAuth: (
    provider: Provider, 
    onSuccess?: () => void
  ) => Promise<void>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateOnboarding: (data: OnboardingData) => Promise<void>;
  syncWithBackend: () => Promise<void>;
  initialized: boolean;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: {
        signIn: false,
        signUp: false,
        googleOAuth: false,
        appleOAuth: false,
        signOut: false,
        fetchUser: false,
        updateOnboarding: false
      },
      error: null,
      initialized: false,
      signIn: async (email, password, onSuccess) => {
        set({ loading: { ...get().loading, signIn: true }, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) {
            set({ error: error.message, loading: { ...get().loading, signIn: false } });
            return;
          }

          if (data.user) {
            const userData = data.user.user_metadata || {};
            
            const user: User = {
              id: data.user.id,
              email: data.user.email ?? '',
              username: userData.username ?? userData.user_name ?? '',
              full_name: userData.full_name ?? userData.name ?? '',
              avatar: userData.avatar_url ?? userData.picture ?? '',
              access_token: data.session?.access_token,
            };
            
            set({ 
              user,
              loading: { ...get().loading, signIn: false }
            });

            const userCheck = apiService.getCurrentUser()
            if (!(await userCheck).data) {
              // Sync with backend
              const userResponse = await apiService.createUser({
                email: data.user.email ?? '',
                username: user.username ?? '',
                supabase_id: data.user.id,
              });

              if (userResponse.error) {
                console.warn('Failed to create user in backend:', userResponse.error);
              }
            }
            
            onSuccess?.();
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Sign in failed', 
            loading: { ...get().loading, signIn: false } 
          });
        }
      },

      signUp: async (email, password, username, onSuccess) => {
        set({ loading: { ...get().loading, signUp: true }, error: null });
        try {
          const { data, error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
              data: {
                username: username
              }
            }
          });
          
          if (error) {
            set({ error: error.message, loading: { ...get().loading, signUp: false } });
            return;
          }

          if (data.user?.email) {
            set({
              loading: { ...get().loading, signUp: false },
            });
            onSuccess?.();
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Sign up failed', 
            loading: { ...get().loading, signUp: false } 
          });
        }
      },

      signInWithOAuth: async (provider: Provider) => {
        const loadingKey = provider === 'google' ? 'googleOAuth' : 'appleOAuth';
        
        set(state => ({ 
          loading: { ...state.loading, [loadingKey]: true }, 
          error: null 
        }));
        
        try {
          // Use environment variable for redirect URL or construct it properly
          const redirectTo = process.env.NODE_ENV === 'production' 
            ? `${process.env.NEXT_PUBLIC_SITE_URL}/callback`
            : `${window.location.origin}/callback`;

          const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo,
              queryParams: {
                access_type: 'offline',
                prompt: 'consent',
              },
            },
          });

          if (error) {
            set(state => ({ 
              error: error.message, 
              loading: { ...state.loading, [loadingKey]: false }
            }));
          } else {
            // console.log(data)
          }
        } catch (error) {
          set(state => ({ 
            error: error instanceof Error ? error.message : 'OAuth authentication failed', 
            loading: { ...state.loading, [loadingKey]: false }
          }));
        }
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null });
      },

      fetchUser: async () => {
        const { data } = await supabase.auth.getUser();
        if (data.user?.email) {
          // Sync with backend if user exists
          await get().syncWithBackend();
        }
      },

      initialize: () => {
        if (get().initialized) return;
        
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user?.email) {
            const user: User = {
              id: session.user.id,
              email: session.user.email,
              // email_confirmed_at: session.user.email_confirmed_at,
              // created_at: session.user.created_at,
              // user_metadata: session.user.user_metadata,
              // app_metadata: session.user.app_metadata,
              access_token: session.access_token,
            };
            set(state => ({ 
              user, 
              initialized: true, 
              loading: { ...state.loading, fetchUser: false }
            }));
          } else {
            set(state => ({ 
              user: null, 
              initialized: true, 
              loading: { ...state.loading, fetchUser: false }
            }));
          }
        });

        // Listen for auth changes
        supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
          console.log('Auth state changed:', event, session);
          
          if (session?.user?.email) {
            const user: User = {
              id: session.user.id,
              email: session.user.email,
              // email_confirmed_at: session.user.email_confirmed_at,
              // created_at: session.user.created_at,
              // user_metadata: session.user.user_metadata,
              // app_metadata: session.user.app_metadata,
              access_token: session.access_token,
            };
            set(state => ({ 
              user, 
              error: null, 
              loading: { 
                ...state.loading, 
                googleOAuth: false, 
                appleOAuth: false 
              }
            }));
          } else {
            set(state => ({ 
              user: null, 
              loading: { 
                ...state.loading, 
                googleOAuth: false, 
                appleOAuth: false 
              }
            }));
          }
        });

        set({ initialized: true });
      },

      updateOnboarding: async (onboardingData: OnboardingData) => {
        const currentUser = get().user;
        if (!currentUser) {
          throw new Error('No user found');
        }

        set({ loading: { ...get().loading, updateOnboarding: true }, error: null });
        
        try {
          // Convert frontend format to backend format
          const backendOnboardingData: Partial<ApiOnboardingData> = {
            role: onboardingData.role,
            CustomLearningGoal: onboardingData.customLearningGoal,
            academic_details: onboardingData.academicDetails ? {
              university: onboardingData.academicDetails.university,
              course: onboardingData.academicDetails.course,
              ...(onboardingData.role === 'jamb' && onboardingData.academicDetails.preferredUniversity && {
                jamb_details: {
                  preferred_university: onboardingData.academicDetails.preferredUniversity,
                  preferred_course: onboardingData.academicDetails.preferredCourse ?? '',
                  target_score: onboardingData.academicDetails.targetScore,
                  jamb_year: onboardingData.academicDetails.jambYear,
                  jamb_subjects: onboardingData.academicDetails.jambSubjects ?? [],
                }
              }),
              ...((['undergraduate', 'university', 'masters'].includes(onboardingData.role)) && onboardingData.academicDetails.university && {
                university_details: {
                  current_university: onboardingData.academicDetails.university,
                  current_course: onboardingData.academicDetails.course ??'',
                  current_level: onboardingData.academicDetails.level,
                  matric_number: onboardingData.academicDetails.matricNumber,
                }
              }),
              ...(onboardingData.role === 'lecturer' && onboardingData.academicDetails.university && {
                lecturer_details: {
                  institution: onboardingData.academicDetails.university,
                  department: onboardingData.academicDetails.course ?? '',
                  experience: onboardingData.academicDetails.experience,
                  academic_title: onboardingData.academicDetails.title,
                }
              }),
              ...(onboardingData.role === 'custom' && onboardingData.customLearningGoal && {
                custom_details: {
                  learning_goal: onboardingData.customLearningGoal,
                  education_level: onboardingData.academicDetails.educationLevel,
                  experience_level: onboardingData.academicDetails.experienceLevel,
                  additional_details: onboardingData.academicDetails.additionalDetails,
                }
              }),
            } : undefined,
          };

          const response = await apiService.updateOnboarding(backendOnboardingData);
          
          if (response.error) {
            set({ error: response.error, loading: { ...get().loading, updateOnboarding: false } });
            throw new Error(response.error);
          }

          // Update local state with completed onboarding
          set({
            user: {
              ...currentUser,
              onboardingData: {
                ...onboardingData,
                completedAt: new Date(),
              },
            },
            loading: { ...get().loading, updateOnboarding: false },
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update onboarding', 
            loading: { ...get().loading, updateOnboarding: false } 
          });
          throw error;
        }
      },

      syncWithBackend: async () => {
        try {
          const response = await apiService.getCurrentUser();
          
          if (response.error) {
            console.warn('Failed to sync with backend:', response.error);
            return;
          }

          if (response.data) {
            const backendUser = response.data;
            
            // Convert backend onboarding data to frontend format
            let onboardingData: OnboardingData | undefined;
            if (backendUser.onboarding_data) {
              const bd = backendUser.onboarding_data;
              onboardingData = {
                role: bd.role,
                customLearningGoal: bd.CustomLearningGoal,
                academicDetails: bd.academic_details ? {
                  university: bd.academic_details.university,
                  course: bd.academic_details.course,
                  // JAMB details
                  preferredUniversity: bd.academic_details.jamb_details?.preferred_university,
                  preferredCourse: bd.academic_details.jamb_details?.preferred_course,
                  targetScore: bd.academic_details.jamb_details?.target_score,
                  jambYear: bd.academic_details.jamb_details?.jamb_year,
                  jambSubjects: bd.academic_details.jamb_details?.jamb_subjects,
                  // University details
                  level: bd.academic_details.university_details?.current_level,
                  matricNumber: bd.academic_details.university_details?.matric_number,
                  // Lecturer details
                  experience: bd.academic_details.lecturer_details?.experience,
                  title: bd.academic_details.lecturer_details?.academic_title,
                  // Custom details
                  educationLevel: bd.academic_details.custom_details?.education_level,
                  experienceLevel: bd.academic_details.custom_details?.experience_level,
                  additionalDetails: bd.academic_details.custom_details?.additional_details,
                } : undefined,
                completedAt: bd.CompletedAt ? new Date(bd.CompletedAt) : undefined,
              };
            }

            set({
              user: {
                id: backendUser.id,
                email: backendUser.email,
                username: backendUser.username,
                full_name: backendUser.full_name,
                avatar: backendUser.avatar,
                onboardingData,
              },
              loading: { ...get().loading, fetchUser: false },
            });
          }
        } catch (error) {
          console.warn('Backend sync failed:', error);
          // Don't set error state - this is a background operation
        }
      },
    }),
    {
      name: "auth-store", // localStorage key
      partialize: (state) => ({ user: state.user }), // only persist user
    }
  )
);
