import { apiService } from "./index";

export interface OnboardingData {
  is_completed: boolean;
  message: string;
}

export interface AcademicDetails {
  University: string;
  Course: string;
  JAMBDetails: {
    PreferredUniversity: string;
    PreferredCourse: string;
    TargetScore: string;
    JAMBYear: string;
    JAMBSubjects: string[];
  };
  university_details: {
    current_university: string;
    current_course: string;
    current_level: string;
    matric_number: string;
  };
  LecturerDetails: {
    Institution: string;
    Department: string;
    Experience: string;
    AcademicTitle: string;
  };
  CustomDetails: {
    LearningGoal: string;
    EducationLevel: string;
    ExperienceLevel: string;
    AdditionalDetails: string;
  };
}

export interface OnboardingRequest {
  // onboarding_data: {
  role: string;
  CustomLearningGoal: string;
  academic_details: AcademicDetails;
  CreatedAt?: string;
  CompletedAt: string;
  // }
}

interface OnboardingResponse {
  success: boolean;
  data: {
    is_completed: boolean;
    message: string;
  };
  meta: {
    request_id: string;
    process_time: number;
    version: string;
  };
  timestamp: string;
}

export const getOnboardingStatus = async () => {
  const res = await apiService.getOnboarding();
  if (res.error) throw new Error(res.error);
  return res.data;
};

export const updateOnboardingStatus = async (
  onboardingData: OnboardingRequest
) => {
  const res = await apiService.updateOnboarding(onboardingData);
  if (res.error) throw new Error(res.error);
  return res;
};
