import { useState } from "react";
import {
  apiService,
  type CourseModule,
  type UpdateModuleRequest,
} from "../services/api";

export const useChapterManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateChapter = async (
    chapterId: string,
    data: UpdateModuleRequest
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.updateChapter(chapterId, data);

      if (response.error) {
        setError(response.error);
        return null;
      }

      return response.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update chapter";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChapter = async (chapterId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.deleteChapter(chapterId);

      if (response.error) {
        setError(response.error);
        return false;
      }

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete chapter";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateChapter,
    deleteChapter,
    isLoading,
    error,
  };
};
