import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookText,
  FileText,
  FolderOpen,
  Grid,
  Image as ImageIcon,
  Layers,
  MessageSquare,
  Plus,
  Upload,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { GlassCard } from "../components/GlassCard";
import { GridView, ListView, SearchFilterBar } from "../components/library/uploads";

export const fileTypeMap = {
  pdf: {
    icon: <FileText className="text-red-500" size={20} />,
    color: "bg-red-100 dark:bg-red-900/30",
  },
  doc: {
    icon: <FileText className="text-blue-500" size={20} />,
    color: "bg-blue-100 dark:bg-blue-900/30",
  },
  image: {
    icon: <ImageIcon className="text-emerald-500" size={20} />,
    color: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  ppt: {
    icon: <Layers className="text-amber-500" size={20} />,
    color: "bg-amber-100 dark:bg-amber-900/30",
  },
};

export default function MyUploads() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Mock data for uploaded files
  const uploadedFiles = [
    {
      id: 1,
      name: "Organic Chemistry Notes.pdf",
      type: "pdf",
      category: "notes",
      size: "4.2 MB",
      tags: ["Chemistry", "Organic"],
      lastModified: "2 days ago",
      starred: true,
      thumbnail: null,
    },
    {
      id: 2,
      name: "Cell Division Diagram.png",
      type: "image",
      category: "images",
      size: "1.8 MB",
      tags: ["Biology", "Cell Biology"],
      lastModified: "1 week ago",
      starred: false,
      thumbnail: null,
    },
    {
      id: 3,
      name: "Calculus Formulas.pdf",
      type: "pdf",
      category: "notes",
      size: "2.5 MB",
      tags: ["Mathematics", "Calculus"],
      lastModified: "1 week ago",
      starred: true,
      thumbnail: null,
    },
    {
      id: 4,
      name: "Physics Assignment 3.docx",
      type: "doc",
      category: "assignments",
      size: "1.2 MB",
      tags: ["Physics", "Homework"],
      lastModified: "2 weeks ago",
      starred: false,
      thumbnail: null,
    },
    {
      id: 5,
      name: "Biology Lecture Slides.pptx",
      type: "ppt",
      category: "slides",
      size: "5.7 MB",
      tags: ["Biology", "Lecture"],
      lastModified: "3 weeks ago",
      starred: false,
      thumbnail: null,
    },
    {
      id: 6,
      name: "English Literature Notes.pdf",
      type: "pdf",
      category: "notes",
      size: "3.1 MB",
      tags: ["English", "Literature"],
      lastModified: "1 month ago",
      starred: false,
      thumbnail: null,
    },
  ];

  // Filter files based on selected category
  const filteredFiles =
    selectedCategory === "all"
      ? uploadedFiles
      : uploadedFiles.filter((file) => file.category === selectedCategory);

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard/library")}
            className="flex items-center text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft size={18} className="mr-1" /> Back to Library
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-1 bg-white/5 hover:bg-white/10"
              onClick={() => navigate("/dashboard/library/upload")}
            >
              <Plus size={16} /> New Upload
            </Button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-transparent bg-clip-text">
            My Uploads
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your uploaded documents, notes, images and study materials
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <SearchFilterBar
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Grid View */}
      {viewMode === "grid" && (
        <GridView files={filteredFiles} />
      )}

      {/* List View */}
      {viewMode === "list" && (
        <ListView files={filteredFiles} />
      )}

      {/* Empty State */}
      {filteredFiles.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-16">
          <div className="p-5 rounded-full bg-white/10 mb-4">
            <FolderOpen size={48} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">No files found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
            We couldn't find any files that match your current filters. Try
            adjusting your search or upload a new file.
          </p>
          <Button
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
            onClick={() => navigate("/dashboard/library/upload")}
          >
            <Upload size={16} className="mr-2" /> Upload New Document
          </Button>
        </div>
      )}

      {/* Storage Usage */}
      <div className="mt-10 mb-6">
        <GlassCard className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold mb-1">Storage Usage</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                You are using 1.2 GB of your 5 GB storage allowance
              </p>
              <div className="w-full md:w-96 h-2 bg-gray-200/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full w-[24%]"></div>
              </div>
              <div className="flex justify-between mt-1 text-xs">
                <span className="text-gray-500">1.2 GB used</span>
                <span className="text-gray-500">5 GB total</span>
              </div>
            </div>
            <Button variant="outline" className="border-dashed">
              Upgrade Storage
            </Button>
          </div>
        </GlassCard>
      </div>

      {/* Quick Access Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <GlassCard className="p-4 hover:bg-white/5 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
              <BookText size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold">Generate Flashcards</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Create interactive cards from your notes
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 hover:bg-white/5 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
              <MessageSquare size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold">Chat with Documents</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ask questions about your uploaded materials
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 hover:bg-white/5 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
              <Grid size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold">Organize Files</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Create folders and tags for better organization
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
