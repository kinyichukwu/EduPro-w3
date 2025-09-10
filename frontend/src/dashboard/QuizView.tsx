import React, { useState, useEffect } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,

} from "@/shared/components/ui/tabs";
import { Switch } from "@/shared/components/ui/switch";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  Loader2,
  FileText,
  LibraryBig,
  Clock,
  CheckCircle2,
  FileQuestion,
  NotebookPen,
  Mic,
  HelpCircle,
  ChevronRight,
  FileIcon,
  PresentationIcon,
  FileTypeIcon,
  CircleSlash,
} from "lucide-react";
import { motion } from "framer-motion";

export default function QuizGenerator() {
  // State management
  const [mode, setMode] = useState("MCQ");
  const [caseStudy, setCaseStudy] = useState(false);
  const [timeLimit, setTimeLimit] = useState("");
  const [sourceType, setSourceType] = useState("uploads");
  const [selectedUploads, setSelectedUploads] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [previewData, setPreviewData] = useState({
    estimatedCount: 8,
    difficultyScore: 3,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSampleQuestion, setShowSampleQuestion] = useState(false);

  // Mock data
  const mockUploads = [
    {
      id: 1,
      name: "Lecture_3_Biology.pdf",
      type: "pdf",
      size: "2.4 MB",
      lastUsed: "2 days ago",
    },
    {
      id: 2,
      name: "Week-2-Slides.pptx",
      type: "pptx",
      size: "4.1 MB",
      lastUsed: "1 week ago",
    },
    {
      id: 3,
      name: "Study_Notes.docx",
      type: "docx",
      size: "1.2 MB",
      lastUsed: "3 days ago",
    },
  ];

  const mockSyllabusTopics = [
    { id: "genetics", name: "Genetics", parent: "biology" },
    { id: "ecology", name: "Ecology", parent: "biology" },
    { id: "cells", name: "Cells", parent: "biology" },
    { id: "photosynthesis", name: "Photosynthesis", parent: "biology" },
  ];

  // Sample question for preview
  const sampleQuestion = {
    MCQ: "Which of the following is NOT a nucleotide found in DNA?\n\nA) Adenine\nB) Uracil\nC) Guanine\nD) Cytosine",
    "True/False":
      "The process of DNA replication is semi-conservative.\n\n○ True\n○ False",
    Essay:
      "Explain the process of meiosis and how it contributes to genetic diversity.",
    Oral: "Describe the structure of DNA and explain how it replicates.",
  };

  // File type icons
  const getFileIcon = (type) => {
    switch (type) {
      case "pdf":
        return <FileText size={18} className="text-red-400" />;
      case "pptx":
        return <PresentationIcon size={18} className="text-orange-400" />;
      case "docx":
        return <FileIcon size={18} className="text-blue-400" />;
      default:
        return <FileTypeIcon size={18} className="text-gray-400" />;
    }
  };

  // Check if generation button should be enabled
  const canGenerate =
    (sourceType === "uploads" && selectedUploads.length > 0) ||
    (sourceType === "syllabus" && selectedTopics.length > 0);

  // Simulate API call when selection changes
  useEffect(() => {
    // This would be a real API call in production
    const timer = setTimeout(() => {
      const difficulty = Math.floor(Math.random() * 5) + 1;
      const count = Math.floor(Math.random() * 10) + 5;
      setPreviewData({ estimatedCount: count, difficultyScore: difficulty });
    }, 300);

    return () => clearTimeout(timer);
  }, [mode, caseStudy, selectedUploads, selectedTopics]);

  // Handle generate quiz
  const handleGenerateQuiz = () => {
    setIsGenerating(true);
    // This would call the API and redirect to the quiz in production
    setTimeout(() => {
      setIsGenerating(false);
      alert("Quiz generated! Redirecting to quiz...");
    }, 2000);
  };

  // Toggle sample question
  const toggleSampleQuestion = () => {
    setShowSampleQuestion(!showSampleQuestion);
  };

  // Mode specific icons
  const getModeIcon = (m, size = 20) => {
    switch (m) {
      case "MCQ":
        return <CheckCircle2 size={size} />;
      case "True/False":
        return <FileQuestion size={size} />;
      case "Essay":
        return <NotebookPen size={size} />;
      case "Oral":
        return <Mic size={size} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/60 to-slate-900 p-4 md:p-8 text-gray-100">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            QuizAI
          </div>
          <div className="hidden md:flex items-center ml-8 text-gray-400">
            <span className="hover:text-white cursor-pointer transition-colors">
              Dashboard
            </span>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-white font-medium">Quiz Generator</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white rounded-full"
        >
          <HelpCircle size={20} />
        </Button>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto"
      >
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 backdrop-blur-md p-6 border-b border-white/10">
            <h1 className="text-2xl font-semibold text-white">
              Create New Quiz
            </h1>
            <p className="text-gray-300 mt-1">
              Configure your quiz settings and sources
            </p>
          </div>

          <div className="p-6">
            {/* Mode Selector */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-white mb-3">
                Question Mode
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["MCQ", "True/False", "Essay", "Oral"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`relative p-4 rounded-xl flex items-center transition-all ${
                      mode === m
                        ? "bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border border-purple-500/50"
                        : "bg-slate-800/50 border border-white/5 hover:border-white/20"
                    }`}
                  >
                    <div
                      className={`
                      absolute top-3 right-3 h-2 w-2 rounded-full 
                      ${
                        mode === m
                          ? "bg-gradient-to-r from-purple-400 to-cyan-400"
                          : "bg-transparent"
                      }
                    `}
                    ></div>
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-slate-800/70 mr-3">
                      <span
                        className={
                          mode === m ? "text-purple-400" : "text-gray-400"
                        }
                      >
                        {getModeIcon(m)}
                      </span>
                    </div>
                    <div>
                      <div
                        className={`font-medium ${
                          mode === m ? "text-white" : "text-gray-300"
                        }`}
                      >
                        {m}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {m === "MCQ" && "Multiple choice"}
                        {m === "True/False" && "Binary choice"}
                        {m === "Essay" && "Written response"}
                        {m === "Oral" && "Speaking practice"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Separator className="bg-white/10 my-6" />

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Case Study Toggle */}
              <div>
                <h2 className="text-sm font-medium text-white mb-2">
                  Case Studies
                </h2>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-lg bg-slate-700/70 mr-3">
                      <LibraryBig size={18} className="text-gray-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-300">
                        Include reading passages
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={caseStudy}
                    onCheckedChange={setCaseStudy}
                    className="data-[state=checked]:bg-gradient-to-r from-purple-500 to-cyan-500"
                  />
                </div>
              </div>

              {/* Timer Field */}
              <div className="md:col-span-2">
                <h2 className="text-sm font-medium text-white mb-2">
                  Quiz Timer (minutes)
                </h2>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-lg bg-slate-700/70">
                      <Clock size={18} className="text-gray-400" />
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max="180"
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(e.target.value)}
                        placeholder="Untimed"
                        className="bg-slate-700/70 border-white/5 text-white focus:border-purple-500/70 focus-visible:ring-purple-500/40"
                      />
                      <div className="flex gap-1">
                        {[15, 30, 60].map((time) => (
                          <Button
                            key={time}
                            variant="outline"
                            size="sm"
                            onClick={() => setTimeLimit(time.toString())}
                            className={`border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 ${
                              timeLimit === time.toString()
                                ? "bg-purple-500/20 border-purple-500/50 text-white"
                                : "text-gray-300"
                            }`}
                          >
                            {time}
                          </Button>
                        ))}
                        {timeLimit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTimeLimit("")}
                            className="border-white/10 hover:bg-red-500/10 hover:border-red-500/50"
                          >
                            <CircleSlash size={14} className="mr-1" />
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Source Tabs */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-white mb-3">
                Input Source
              </h2>
              <Tabs
                defaultValue="uploads"
                value={sourceType}
                onValueChange={setSourceType}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 bg-slate-800/50 border border-white/5 rounded-xl mb-4 p-1">
                  <TabsTrigger
                    value="uploads"
                    className="rounded-lg data-[state=active]:bg-gradient-to-r from-purple-500/30 to-cyan-500/30 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:backdrop-blur-sm"
                  >
                    <FileText size={16} className="mr-2" />
                    My Uploads
                  </TabsTrigger>
                  <TabsTrigger
                    value="syllabus"
                    className="rounded-lg data-[state=active]:bg-gradient-to-r from-purple-500/30 to-cyan-500/30 data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:backdrop-blur-sm"
                  >
                    <LibraryBig size={16} className="mr-2" />
                    Syllabus Topics
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="uploads"
                  className="bg-slate-800/40 backdrop-blur-md rounded-xl p-4 border border-white/5"
                >
                  <ScrollArea className="h-56">
                    <div className="space-y-1">
                      {mockUploads.map((file) => (
                        <div
                          key={file.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedUploads.includes(file.id)
                              ? "bg-purple-500/20 border border-purple-500/40"
                              : "hover:bg-slate-700/40 border border-transparent hover:border-white/10"
                          }`}
                          onClick={() => {
                            if (selectedUploads.includes(file.id)) {
                              setSelectedUploads(
                                selectedUploads.filter((id) => id !== file.id)
                              );
                            } else {
                              setSelectedUploads([...selectedUploads, file.id]);
                            }
                          }}
                        >
                          <Checkbox
                            checked={selectedUploads.includes(file.id)}
                            className="data-[state=checked]:bg-gradient-to-r from-purple-500 to-cyan-500 border-white/20"
                          />
                          {getFileIcon(file.type)}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">
                              {file.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              {file.size} • Last used {file.lastUsed}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent
                  value="syllabus"
                  className="bg-slate-800/40 backdrop-blur-md rounded-xl p-4 border border-white/5"
                >
                  <div className="flex items-center gap-2 mb-4 text-sm text-gray-300 bg-slate-800/70 rounded-lg p-2 px-3">
                    <span className="font-medium text-white">WAEC</span>
                    <ChevronRight size={14} />
                    <span className="font-medium text-white">Biology</span>
                  </div>
                  <ScrollArea className="h-48">
                    <div className="space-y-1">
                      {mockSyllabusTopics.map((topic) => (
                        <div
                          key={topic.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedTopics.includes(topic.id)
                              ? "bg-purple-500/20 border border-purple-500/40"
                              : "hover:bg-slate-700/40 border border-transparent hover:border-white/10"
                          }`}
                          onClick={() => {
                            if (selectedTopics.includes(topic.id)) {
                              setSelectedTopics(
                                selectedTopics.filter((id) => id !== topic.id)
                              );
                            } else {
                              setSelectedTopics([...selectedTopics, topic.id]);
                            }
                          }}
                        >
                          <Checkbox
                            checked={selectedTopics.includes(topic.id)}
                            className="data-[state=checked]:bg-gradient-to-r from-purple-500 to-cyan-500 border-white/20"
                          />
                          <div className="text-sm font-medium text-white">
                            {topic.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>

            {/* Preview Card & Generate Button */}
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-gradient-to-br from-slate-900/80 to-purple-900/30 border-white/10 backdrop-blur-sm shadow-lg overflow-hidden">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-5 bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent flex items-center">
                      <FileQuestion
                        size={18}
                        className="text-purple-400 mr-2"
                      />
                      Quiz Preview
                    </h3>

                    <div className="space-y-5">
                      <div className="flex items-center justify-between bg-slate-800/60 p-3 rounded-lg border border-white/5">
                        <span className="text-gray-300 flex items-center">
                          <CheckCircle2
                            size={16}
                            className="text-purple-400 mr-2"
                          />
                          Estimated Questions
                        </span>
                        <span className="text-white font-semibold text-lg">
                          {previewData.estimatedCount}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">
                            Difficulty Level:
                          </span>
                          <span className="text-white font-medium px-3 py-1 rounded-full bg-slate-800/60 text-sm border border-white/5">
                            {
                              [
                                "Very Easy",
                                "Easy",
                                "Medium",
                                "Hard",
                                "Very Hard",
                              ][previewData.difficultyScore - 1]
                            }
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
                            style={{
                              width: `${previewData.difficultyScore * 20}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleSampleQuestion}
                        className="w-full border-white/10 hover:bg-slate-800/80 text-gray-300 hover:text-white"
                      >
                        {showSampleQuestion
                          ? "Hide Sample Question"
                          : "See Sample Question"}
                      </Button>

                      {showSampleQuestion && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-slate-800/60 p-4 rounded-lg mt-2 text-gray-200 text-sm border border-white/5"
                        >
                          <div className="whitespace-pre-line">
                            {sampleQuestion[mode] ||
                              "Sample question for this mode"}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <div className="flex flex-col justify-center items-center gap-4">
                <Button
                  disabled={!canGenerate || isGenerating}
                  onClick={handleGenerateQuiz}
                  className={`w-full py-6 text-lg font-medium rounded-xl shadow-lg transition-all ${
                    canGenerate && !isGenerating
                      ? "bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
                      : "bg-slate-800/60 text-gray-500 border border-white/5"
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      AI is crafting questions...
                    </>
                  ) : (
                    "Generate Questions"
                  )}
                </Button>

                <p className="text-sm text-gray-400 text-center px-6">
                  {canGenerate
                    ? `Ready to create a ${mode} quiz with ${
                        previewData.estimatedCount
                      } questions${
                        timeLimit ? ` and a ${timeLimit}-minute timer` : ""
                      }.`
                    : "Please select at least one document or topic to continue."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
