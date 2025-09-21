import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  apiService,
  CourseModule,
  ModuleWithLinks,
  CreateModuleRequest,
  UpdateModuleRequest,
  AddModuleLinkRequest,
} from "../services/api";

// Hook for fetching modules for a course
export const useModules = (courseId: string) => {
  return useQuery({
    queryKey: ["modules", courseId],
    queryFn: async () => {
      const response = await apiService.getModules(courseId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching a single module with links
export const useModule = (courseId: string, moduleId: string) => {
  return useQuery({
    queryKey: ["module", courseId, moduleId],
    queryFn: async () => {
      const response = await apiService.getModule(courseId, moduleId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    enabled: !!courseId && !!moduleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for creating a module
export const useCreateModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      request,
    }: {
      courseId: string;
      request: CreateModuleRequest;
    }) => {
      const response = await apiService.createModule(courseId, request);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    onSuccess: (_, { courseId }) => {
      // Invalidate modules list for the course
      queryClient.invalidateQueries({ queryKey: ["modules", courseId] });

      // Invalidate course data to update module counts
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });

      toast.success("Module created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create module");
    },
  });
};

// Hook for updating a module
export const useUpdateModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      moduleId,
      request,
    }: {
      courseId: string;
      moduleId: string;
      request: UpdateModuleRequest;
    }) => {
      const response = await apiService.updateModule(
        courseId,
        moduleId,
        request
      );
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    onSuccess: (updatedModule, { courseId, moduleId }) => {
      // Update the module in the cache
      queryClient.setQueryData(
        ["module", courseId, moduleId],
        (oldData: ModuleWithLinks | undefined) =>
          oldData ? { ...oldData, module: updatedModule } : undefined
      );

      // Invalidate modules list
      queryClient.invalidateQueries({ queryKey: ["modules", courseId] });

      // Invalidate course data to update module counts
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });

      toast.success("Module updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update module");
    },
  });
};

// Hook for deleting a module
export const useDeleteModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      moduleId,
    }: {
      courseId: string;
      moduleId: string;
    }) => {
      const response = await apiService.deleteModule(courseId, moduleId);
      if (response.error) {
        throw new Error(response.error);
      }
    },
    onSuccess: (_, { courseId, moduleId }) => {
      // Remove the module from the cache
      queryClient.removeQueries({ queryKey: ["module", courseId, moduleId] });

      // Invalidate modules list
      queryClient.invalidateQueries({ queryKey: ["modules", courseId] });

      // Invalidate course data to update module counts
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });

      toast.success("Module deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete module");
    },
  });
};

// Hook for adding a link to a module
export const useAddModuleLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      moduleId,
      request,
    }: {
      courseId: string;
      moduleId: string;
      request: AddModuleLinkRequest;
    }) => {
      const response = await apiService.addModuleLink(
        courseId,
        moduleId,
        request
      );
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    onSuccess: (newLink, { courseId, moduleId }) => {
      // Update the module data in the cache to include the new link
      queryClient.setQueryData(
        ["module", courseId, moduleId],
        (oldData: ModuleWithLinks | undefined) =>
          oldData
            ? { ...oldData, links: [...oldData.links, newLink] }
            : undefined
      );

      toast.success("Link added successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add link");
    },
  });
};

// Hook for deleting a module link
export const useDeleteModuleLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      moduleId,
      linkId,
    }: {
      courseId: string;
      moduleId: string;
      linkId: string;
    }) => {
      const response = await apiService.deleteModuleLink(
        courseId,
        moduleId,
        linkId
      );
      if (response.error) {
        throw new Error(response.error);
      }
    },
    onSuccess: (_, { courseId, moduleId, linkId }) => {
      // Remove the link from the module data in the cache
      queryClient.setQueryData(
        ["module", courseId, moduleId],
        (oldData: ModuleWithLinks | undefined) =>
          oldData
            ? {
                ...oldData,
                links: oldData.links.filter((link) => link.id !== linkId),
              }
            : undefined
      );

      toast.success("Link deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete link");
    },
  });
};

// Custom hook for module management with local state
export const useModuleManagement = (courseId: string) => {
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(
    null
  );

  const { data: modules, isLoading, error } = useModules(courseId);
  const createModuleMutation = useCreateModule();
  const updateModuleMutation = useUpdateModule();
  const deleteModuleMutation = useDeleteModule();
  const addLinkMutation = useAddModuleLink();
  const deleteLinkMutation = useDeleteModuleLink();

  const handleCreateModule = async (request: CreateModuleRequest) => {
    try {
      const newModule = await createModuleMutation.mutateAsync({
        courseId,
        request,
      });
      return newModule;
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateModule = async (
    moduleId: string,
    request: UpdateModuleRequest
  ) => {
    try {
      const updatedModule = await updateModuleMutation.mutateAsync({
        courseId,
        moduleId,
        request,
      });
      if (selectedModule?.id === moduleId) {
        setSelectedModule(updatedModule);
      }
      return updatedModule;
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    try {
      await deleteModuleMutation.mutateAsync({ courseId, moduleId });
      if (selectedModule?.id === moduleId) {
        setSelectedModule(null);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleAddLink = async (
    moduleId: string,
    request: AddModuleLinkRequest
  ) => {
    try {
      const newLink = await addLinkMutation.mutateAsync({
        courseId,
        moduleId,
        request,
      });
      return newLink;
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteLink = async (moduleId: string, linkId: string) => {
    try {
      await deleteLinkMutation.mutateAsync({ courseId, moduleId, linkId });
    } catch (error) {
      throw error;
    }
  };

  return {
    // Data
    modules: modules || [],
    selectedModule,

    // Loading states
    isLoading,
    isCreating: createModuleMutation.isPending,
    isUpdating: updateModuleMutation.isPending,
    isDeleting: deleteModuleMutation.isPending,
    isAddingLink: addLinkMutation.isPending,
    isDeletingLink: deleteLinkMutation.isPending,

    // Error states
    error,

    // Actions
    setSelectedModule,
    createModule: handleCreateModule,
    updateModule: handleUpdateModule,
    deleteModule: handleDeleteModule,
    addLink: handleAddLink,
    deleteLink: handleDeleteLink,
  };
};
