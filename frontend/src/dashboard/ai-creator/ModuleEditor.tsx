import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  ArrowLeft,
  Save,
  Sparkles,
  Loader2,
  Plus,
  Trash2,
  Link as LinkIcon,
  BookOpen,
} from "lucide-react";
import { useModule } from "@/hooks/useModules";
import {
  useUpdateModule,
  useAddModuleLink,
  useDeleteModuleLink,
} from "@/hooks/useModules";
import { apiService } from "@/services/api";
import { toast } from "sonner";

export default function ModuleEditor() {
  const { courseId, moduleId } = useParams<{
    courseId: string;
    moduleId: string;
  }>();
  const navigate = useNavigate();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [showAddLink, setShowAddLink] = useState(false);

  // AI state
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [showAIAssist, setShowAIAssist] = useState(false);

  // Hooks
  const {
    data: moduleData,
    isLoading,
    error,
  } = useModule(courseId!, moduleId!);
  const updateModuleMutation = useUpdateModule();
  const addLinkMutation = useAddModuleLink();
  const deleteLinkMutation = useDeleteModuleLink();

  // Initialize form with module data
  useEffect(() => {
    if (moduleData) {
      setTitle(moduleData.module.title);
      setDescription(moduleData.module.description);
      setContent(moduleData.module.content || "");
    }
  }, [moduleData]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      await updateModuleMutation.mutateAsync({
        courseId: courseId!,
        moduleId: moduleId!,
        request: {
          title: title.trim(),
          description: description.trim(),
          content: content.trim(),
        },
      });
      toast.success("Module saved successfully!");
    } catch (error) {
      console.error("Failed to save module:", error);
    }
  };


  const handleGenerateContent = async (replaceAll = false) => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a prompt for content generation");
      return;
    }

    setIsGeneratingContent(true);
    try {
      const response = await apiService.generateModuleContent(courseId!, {
        prompt: aiPrompt,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      const generatedContent = response.data!.content;

      if (replaceAll) {
        setContent(generatedContent);
      } else {
        // Append to existing content
        const separator = content.trim() ? "\n\n" : "";
        setContent(content + separator + generatedContent);
      }

      setAiPrompt(""); // Clear the prompt after generation
      toast.success("Content generated successfully!");
    } catch (error) {
      toast.error("Failed to generate content");
      console.error("Content generation error:", error);
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const handleAddLink = async () => {
    if (!newLinkUrl.trim()) {
      toast.error("URL is required");
      return;
    }

    try {
      await addLinkMutation.mutateAsync({
        courseId: courseId!,
        moduleId: moduleId!,
        request: {
          url: newLinkUrl.trim(),
          title: newLinkTitle.trim() || undefined,
        },
      });

      setNewLinkUrl("");
      setNewLinkTitle("");
      setShowAddLink(false);
      toast.success("Link added successfully!");
    } catch (error) {
      console.error("Failed to add link:", error);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      await deleteLinkMutation.mutateAsync({
        courseId: courseId!,
        moduleId: moduleId!,
        linkId,
      });
      toast.success("Link deleted successfully!");
    } catch (error) {
      console.error("Failed to delete link:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-turbo-purple mx-auto mb-4" />
          <p className="text-white/60">Loading module...</p>
        </div>
      </div>
    );
  }

  if (error || !moduleData) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Failed to load module
          </h2>
          <p className="text-white/60 mb-4">
            {error instanceof Error ? error.message : "Something went wrong"}
          </p>
          <Button onClick={() => navigate(`/dashboard/ai-creator/${courseId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full space-y-6">
      {/* Header */}
      <section className="flex flex-col bg-dark-card/40 w-full rounded-xl border border-white/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/dashboard/ai-creator/${courseId}`)}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Course
            </Button>
          </div>

          <Button
            onClick={handleSave}
            disabled={updateModuleMutation.isPending}
            className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white"
          >
            {updateModuleMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {updateModuleMutation.isPending ? "Saving..." : "Save Module"}
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-turbo-purple" />
          <h1 className="text-2xl font-bold text-white">Edit Module</h1>
        </div>
      </section>


      {/* Module Form */}
      <section className="bg-dark-card/40 w-full rounded-xl border border-white/5 p-6">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Module Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter module title..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-turbo-purple focus:ring-turbo-purple/20"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this module covers..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-turbo-purple focus:ring-turbo-purple/20"
              rows={3}
            />
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-white">
                Module Content
              </label>
              <Button
                onClick={() => setShowAIAssist(!showAIAssist)}
                size="sm"
                variant="ghost"
                className="text-turbo-purple hover:text-turbo-purple/80 hover:bg-turbo-purple/10 text-xs"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                AI Assist
              </Button>
            </div>

            {/* AI Assistant Panel */}
            {showAIAssist && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-4 bg-gradient-to-r from-turbo-purple/10 to-turbo-indigo/10 rounded-lg border border-turbo-purple/20"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-turbo-purple" />
                    <h4 className="text-sm font-medium text-white">
                      AI Content Assistant
                    </h4>
                  </div>
                  <Input
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="What content would you like to add? e.g., 'Add an example of React hooks'"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleGenerateContent(false)}
                      disabled={isGeneratingContent || !aiPrompt.trim()}
                      size="sm"
                      className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white"
                    >
                      {isGeneratingContent ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Plus className="w-3 h-3 mr-1" />
                      )}
                      {isGeneratingContent ? "Generating..." : "Add to Content"}
                    </Button>
                    <Button
                      onClick={() => handleGenerateContent(true)}
                      disabled={isGeneratingContent || !aiPrompt.trim()}
                      size="sm"
                      variant="outline"
                      className="border-turbo-purple/30 text-turbo-purple hover:bg-turbo-purple/10"
                    >
                      Replace All
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your module content here... You can use markdown formatting.

# Module Title

## Introduction
Start with an overview of what students will learn...

## Main Content
Add your detailed explanations, examples, and exercises...

## Key Takeaways
- Important point 1
- Important point 2

## Next Steps
What should students do after completing this module?"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-turbo-purple focus:ring-turbo-purple/20 font-mono text-sm resize-y min-h-[500px]"
              rows={30}
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-white/40">
                Supports markdown formatting for better content structure
              </p>
              <p className="text-xs text-white/40">
                {content?.length || 0} characters
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Links Section */}
      <section className="bg-dark-card/40 w-full rounded-xl border border-white/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-turbo-indigo" />
            Resource Links
          </h2>
          <Button
            onClick={() => setShowAddLink(true)}
            size="sm"
            variant="outline"
            className="border-turbo-indigo/30 text-turbo-indigo hover:bg-turbo-indigo/10"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Link
          </Button>
        </div>

        {/* Add Link Form */}
        {showAddLink && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10"
          >
            <div className="space-y-3">
              <Input
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
              <Input
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
                placeholder="Link title (optional)"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleAddLink}
                  disabled={addLinkMutation.isPending}
                  size="sm"
                  className="bg-turbo-indigo hover:bg-turbo-indigo/80"
                >
                  {addLinkMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Add Link
                </Button>
                <Button
                  onClick={() => {
                    setShowAddLink(false);
                    setNewLinkUrl("");
                    setNewLinkTitle("");
                  }}
                  size="sm"
                  variant="ghost"
                  className="text-white/60 hover:text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Links List */}
        <div className="space-y-2">
          {moduleData?.links?.length === 0 ? (
            <p className="text-white/40 text-center py-8">
              No resource links added yet
            </p>
          ) : (
            moduleData?.links?.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex-1">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-turbo-indigo hover:text-turbo-indigo/80 font-medium"
                  >
                    {link.title || link.url}
                  </a>
                  {link.title && (
                    <p className="text-white/40 text-sm mt-1">{link.url}</p>
                  )}
                </div>
                <Button
                  onClick={() => handleDeleteLink(link.id)}
                  disabled={deleteLinkMutation.isPending}
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
