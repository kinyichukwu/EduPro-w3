import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { 
  ArrowLeft, 
  Save, 
  Sparkles, 
  Plus, 
  Trash2, 
  Link as LinkIcon,
  Eye,
  CheckCircle,
  MessageCircle
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/shared/lib/utils";

interface Module {
  id: number;
  title: string;
  description: string;
  content: string;
  links: string[];
  order: number;
  status: "draft" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

// Sample module data
const sampleModule: Module = {
  id: 1,
  title: "Getting Started with React",
  description: "Introduction to React, JSX, and components",
  content: `# Getting Started with React

React is a JavaScript library for building user interfaces. It was created by Facebook and is now maintained by Facebook and the community.

## What is React?

React is a declarative, efficient, and flexible JavaScript library for building user interfaces. It lets you compose complex UIs from small and isolated pieces of code called "components".

## Key Concepts

### Components
Components are the building blocks of React applications. They are reusable pieces of code that return JSX elements.

### JSX
JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files.

### Props
Props are how you pass data from parent components to child components.

## Your First Component

Here's a simple React component:

\`\`\`jsx
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}
\`\`\`

This component accepts a single "props" object argument with data and returns a React element.`,
  links: [
    "https://reactjs.org/docs/getting-started.html",
    "https://reactjs.org/tutorial/tutorial.html"
  ],
  order: 1,
  status: "draft",
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-01-20"),
};

export default function ModuleEditor() {
  const navigate = useNavigate();
  const { courseId, moduleId } = useParams();
  const [module, setModule] = useState<Module>(sampleModule);
  const [newLink, setNewLink] = useState("");
  const [isAIMode, setIsAIMode] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleBack = () => {
    navigate(`/dashboard/ai-creator/${courseId}`);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setModule(prev => ({ ...prev, updatedAt: new Date() }));
    setIsSaving(false);
  };

  const handleMarkComplete = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setModule(prev => ({ ...prev, status: "completed", updatedAt: new Date() }));
    setIsSaving(false);
  };

  const handleAddLink = () => {
    if (newLink.trim()) {
      setModule(prev => ({
        ...prev,
        links: [...prev.links, newLink.trim()]
      }));
      setNewLink("");
    }
  };

  const handleRemoveLink = (index: number) => {
    setModule(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const aiContent = `\n\n## AI Generated Content\n\n${aiPrompt}\n\nThis content was generated based on your prompt. You can edit and customize it as needed.`;
    setModule(prev => ({
      ...prev,
      content: prev.content + aiContent
    }));
    
    setAiPrompt("");
    setIsGenerating(false);
    setIsAIMode(false);
  };

  const wordCount = module.content.split(/\s+/).filter(word => word.length > 0).length;
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="h-full w-full space-y-6">
      {/* Header */}
      <section className="flex flex-col bg-dark-card/40 w-full rounded-xl border border-white/5 p-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            onClick={handleBack}
            variant="ghost"
            size="icon"
            className="hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold gradient-text">
              Edit Module
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Module {module.order} • {estimatedReadTime} min read • {wordCount} words
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsAIMode(!isAIMode)}
              variant="outline"
              className={cn(
                "border-turbo-purple/30 hover:bg-turbo-purple/10",
                isAIMode ? "bg-turbo-purple/20 text-turbo-purple" : "text-turbo-purple"
              )}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Assist
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-white/70 hover:text-white hover:bg-white/10"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-turbo-purple/20 hover:bg-turbo-purple/30 text-turbo-purple border border-turbo-purple/30"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-turbo-purple/30 border-t-turbo-purple rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
            {module.status === "draft" && (
              <Button
                onClick={handleMarkComplete}
                disabled={isSaving}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-500/80 hover:to-green-600/80 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark Complete
              </Button>
            )}
          </div>
        </div>

        {/* Module Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Module Title
            </label>
            <Input
              value={module.title}
              onChange={(e) => setModule(prev => ({ ...prev, title: e.target.value }))}
              className="bg-white/5 border-white/20 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Description
            </label>
            <Input
              value={module.description}
              onChange={(e) => setModule(prev => ({ ...prev, description: e.target.value }))}
              className="bg-white/5 border-white/20 text-white"
            />
          </div>
        </div>
      </section>

      {/* AI Assistant Panel */}
      {isAIMode && (
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-turbo-purple/10 to-turbo-indigo/10 border border-turbo-purple/20 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-turbo-purple/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-turbo-purple" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Content Assistant</h3>
              <p className="text-white/60 text-sm">
                Describe what you want to add to this module
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g., Add a section about React hooks with examples"
              className="flex-1 bg-white/5 border-white/20 text-white placeholder-white/40"
              rows={2}
            />
            <Button
              onClick={handleAIGenerate}
              disabled={isGenerating || !aiPrompt.trim()}
              className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </motion.section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Editor */}
        <section className="lg:col-span-2 bg-dark-card/40 rounded-xl border border-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Module Content</h2>
            <div className="text-sm text-white/60">
              {wordCount} words • {estimatedReadTime} min read
            </div>
          </div>
          
          <Textarea
            value={module.content}
            onChange={(e) => setModule(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Start writing your module content here. You can use Markdown formatting..."
            className="min-h-[500px] bg-white/5 border-white/20 text-white placeholder-white/40 font-mono text-sm"
          />
        </section>

        {/* Links & Resources */}
        <section className="bg-dark-card/40 rounded-xl border border-white/5 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Links & Resources</h2>
          
          {/* Add Link */}
          <div className="mb-4">
            <div className="flex gap-2">
              <Input
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 bg-white/5 border-white/20 text-white placeholder-white/40"
              />
              <Button
                onClick={handleAddLink}
                size="sm"
                className="bg-turbo-purple/20 hover:bg-turbo-purple/30 text-turbo-purple border border-turbo-purple/30"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Links List */}
          <div className="space-y-2">
            {module.links.length === 0 ? (
              <div className="text-center py-8 text-white/50">
                <LinkIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No links added yet</p>
              </div>
            ) : (
              module.links.map((link, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <LinkIcon className="w-4 h-4 text-turbo-purple flex-shrink-0" />
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-sm text-white/80 hover:text-white truncate"
                  >
                    {link}
                  </a>
                  <Button
                    onClick={() => handleRemoveLink(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
