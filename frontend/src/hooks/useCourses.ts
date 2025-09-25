import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  apiService,
  Course,
  CreateCourseRequest,
  UpdateCourseRequest,
} from "../services/api";

// Hook for fetching courses
export const useCourses = (params?: {
  status?: "draft" | "published" | "archived";
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["courses", params],
    queryFn: async () => {
      const response = await apiService.getCourses(params);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching a single course
export const useCourse = (courseId: string) => {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const response = await apiService.getCourse(courseId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Public: Hook for browsing published courses
export const usePublicCourses = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["public-courses", params],
    queryFn: async () => {
      const response = await apiService.getPublicCourses(params);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Public: Hook for single published course
export const usePublicCourse = (courseId: string) => {
  return useQuery({
    queryKey: ["public-course", courseId],
    queryFn: async () => {
      const response = await apiService.getPublicCourse(courseId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for fetching course statistics
export const useCourseStats = () => {
  return useQuery({
    queryKey: ["courseStats"],
    queryFn: async () => {
      const response = await apiService.getCourseStats();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for creating a course
export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateCourseRequest) => {
      const response = await apiService.createCourse(request);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    onSuccess: (newCourse) => {
      // Invalidate and refetch courses
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["courseStats"] });

      // Add the new course to the cache
      queryClient.setQueryData(["course", newCourse.id], newCourse);

      toast.success("Course created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create course");
    },
  });
};

// Hook for updating a course
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      request,
    }: {
      courseId: string;
      request: UpdateCourseRequest;
    }) => {
      const response = await apiService.updateCourse(courseId, request);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    onSuccess: (updatedCourse) => {
      // Update the course in the cache
      queryClient.setQueryData(["course", updatedCourse.id], updatedCourse);

      // Invalidate courses list to reflect changes
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["courseStats"] });

      toast.success("Course updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update course");
    },
  });
};

// Hook for deleting a course
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const response = await apiService.deleteCourse(courseId);
      if (response.error) {
        throw new Error(response.error);
      }
    },
    onSuccess: (_, courseId) => {
      // Remove the course from the cache
      queryClient.removeQueries({ queryKey: ["course", courseId] });

      // Invalidate courses list
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["courseStats"] });

      toast.success("Course deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete course");
    },
  });
};

// Custom hook for course management with local state
export const useCourseManagement = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [filter, setFilter] = useState<
    "all" | "draft" | "published" | "archived"
  >("all");

  const {
    data: courses,
    isLoading,
    error,
  } = useCourses({
    status: filter === "all" ? undefined : filter,
  });

  const { data: stats } = useCourseStats();
  const createCourseMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();
  const deleteCourseMutation = useDeleteCourse();

  const handleCreateCourse = async (request: CreateCourseRequest) => {
    try {
      const newCourse = await createCourseMutation.mutateAsync(request);
      setSelectedCourse(newCourse);
      return newCourse;
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateCourse = async (
    courseId: string,
    request: UpdateCourseRequest
  ) => {
    try {
      const updatedCourse = await updateCourseMutation.mutateAsync({
        courseId,
        request,
      });
      if (selectedCourse?.id === courseId) {
        setSelectedCourse(updatedCourse);
      }
      return updatedCourse;
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await deleteCourseMutation.mutateAsync(courseId);
      if (selectedCourse?.id === courseId) {
        setSelectedCourse(null);
      }
    } catch (error) {
      throw error;
    }
  };

  return {
    // Data
    courses: courses || [],
    stats,
    selectedCourse,
    filter,

    // Loading states
    isLoading,
    isCreating: createCourseMutation.isPending,
    isUpdating: updateCourseMutation.isPending,
    isDeleting: deleteCourseMutation.isPending,

    // Error states
    error,

    // Actions
    setSelectedCourse,
    setFilter,
    createCourse: handleCreateCourse,
    updateCourse: handleUpdateCourse,
    deleteCourse: handleDeleteCourse,
  };
};
