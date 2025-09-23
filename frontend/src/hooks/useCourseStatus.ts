import { useState } from "react";
import { apiService, type UpdateCourseStatusRequest } from "../services/api";

export const useCourseStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (
    courseId: string,
    status: UpdateCourseStatusRequest["status"]
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.updateCourseStatus(courseId, {
        status,
      });

      if (response.error) {
        setError(response.error);
        return null;
      }

      return response.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update course status";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateStatus,
    isLoading,
    error,
  };
};
