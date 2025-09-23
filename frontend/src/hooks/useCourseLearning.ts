import { useState, useEffect } from "react";
import { apiService, type CourseLearningContent } from "../services/api";

export const useCourseLearning = (courseId: string | null) => {
  const [data, setData] = useState<CourseLearningContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLearningContent = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.getCourseLearningContent(id);

      if (response.error) {
        setError(response.error);
        setData(null);
        return;
      }

      setData(response.data || null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch learning content";
      setError(errorMessage);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    if (courseId) {
      fetchLearningContent(courseId);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchLearningContent(courseId);
    }
  }, [courseId]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
};
