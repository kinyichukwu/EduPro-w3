import { useState, useEffect } from "react";
import {
  apiService,
  type CourseProgressResponse,
  type CourseProgressRequest,
} from "../services/api";

export const useCourseProgress = (courseId: string | null) => {
  const [progress, setProgress] = useState<CourseProgressResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.getCourseProgress(id);

      if (response.error) {
        setError(response.error);
        setProgress(null);
        return;
      }

      setProgress(response.data || null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch progress";
      setError(errorMessage);
      setProgress(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgress = async (
    id: string,
    progressData: CourseProgressRequest
  ) => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await apiService.updateCourseProgress(id, progressData);

      if (response.error) {
        setError(response.error);
        return null;
      }

      const updatedProgress = response.data;
      setProgress(updatedProgress || null);
      return updatedProgress;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update progress";
      setError(errorMessage);
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  const refetch = () => {
    if (courseId) {
      fetchProgress(courseId);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchProgress(courseId);
    }
  }, [courseId]);

  return {
    progress,
    isLoading,
    isUpdating,
    error,
    updateProgress: courseId
      ? (data: CourseProgressRequest) => updateProgress(courseId, data)
      : null,
    refetch,
  };
};
