import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { GlassCard } from "../components/GlassCard";
import {
  GridView,
  ListView,
  SearchFilterBar,
} from "../components/library/uploads";
import { ragService, type Document } from "@/services/rag";
// import { useToast } from "@/shared/hooks";

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
  // const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);

  const {
    data: documentsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["documents", page],
    queryFn: () => ragService.listDocuments(page),
    staleTime: 30000, // 30 seconds
  });

  // Accumulate documents from all pages (backend returns { documents, page, total, has_more })
  useEffect(() => {
    if (documentsResponse) {
      const newDocs = documentsResponse.documents || [];
      if (page === 1) {
        setAllDocuments(newDocs);
      } else {
        setAllDocuments((prev) => [...prev, ...newDocs]);
      }
    }
  }, [documentsResponse, page]);

  // Convert Document to the format expected by existing components
  const convertDocumentToFile = (doc: Document) => ({
    id: doc.id,
    name: doc.title,
    type: getFileTypeFromMime(doc.mime_type),
    category: getCategoryFromMime(doc.mime_type),
    size: doc.size ? formatFileSize(doc.size) : "Unknown",
    tags: [],
    lastModified: new Date(doc.created_at).toLocaleDateString(),
    starred: false,
    thumbnail: null,
    source_url: doc.source_url || undefined,
    document_id: doc.id,
    processing_status: doc.processing_status,
    error: doc.error,
  });

  const getFileTypeFromMime = (mimeType: string): string => {
    if (mimeType.includes("pdf")) return "pdf";
    if (mimeType.includes("word") || mimeType.includes("document"))
      return "doc";
    if (mimeType.includes("image")) return "image";
    if (mimeType.includes("presentation")) return "ppt";
    return "doc";
  };

  const getCategoryFromMime = (mimeType: string): string => {
    if (mimeType.includes("pdf")) return "notes";
    if (mimeType.includes("word") || mimeType.includes("document"))
      return "assignments";
    if (mimeType.includes("image")) return "images";
    if (mimeType.includes("presentation")) return "slides";
    return "notes";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const convertedFiles = allDocuments.map(convertDocumentToFile);

  // Filter files based on selected category
  const filteredFiles =
    selectedCategory === "all"
      ? convertedFiles
      : convertedFiles.filter((file) => file.category === selectedCategory);

  const handleChatWithDocument = async (_documentId: string, title: string) => {
    try {
      // Create a new chat and navigate to it
      const newChat = await ragService.createChat();

      console.log("Chat created:", `Started a new conversation about ${title}`);

      // Navigate to the new chat
      navigate(`/dashboard/chats/${newChat.id}`);
    } catch (error) {
      console.error("Failed to create chat:", error);
      alert(
        `Failed to create chat: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleDeleteDocument = async (documentId: string, title: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await ragService.deleteDocument(documentId);

      // Remove document from local state
      setAllDocuments((prev) => prev.filter((doc) => doc.id !== documentId));

      console.log("Document deleted:", title);
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert(
        `Failed to delete document: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleReprocessDocument = async (documentId: string, title: string) => {
    if (
      !confirm(
        `Reprocess "${title}"? This will re-extract and re-index the document content.`
      )
    ) {
      return;
    }

    try {
      await ragService.reprocessDocument(documentId);

      // Update document status in local state
      setAllDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId
            ? { ...doc, processing_status: "queued", error: null }
            : doc
        )
      );

      console.log("Document reprocessing started:", title);
    } catch (error) {
      console.error("Failed to reprocess document:", error);
      alert(
        `Failed to reprocess document: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const loadMoreDocuments = () => {
    if (documentsResponse?.has_more) {
      setPage((prev) => prev + 1);
    }
  };

  const hasMoreDocuments = Boolean(documentsResponse?.has_more);

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

      {/* Loading State */}
      {isLoading && page === 1 && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <span className="ml-2 text-white/60">Loading documents...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center text-center py-16">
          <div className="p-5 rounded-full bg-red-500/10 mb-4">
            <RefreshCw size={48} className="text-red-400" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-white">
            Failed to load documents
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
            There was an error loading your documents. Please try again.
          </p>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="bg-white/5 hover:bg-white/10"
          >
            <RefreshCw size={16} className="mr-2" /> Try Again
          </Button>
        </div>
      )}

      {/* Grid View */}
      {!isLoading && !error && viewMode === "grid" && (
        <GridView
          files={filteredFiles}
          onChatWithDocument={handleChatWithDocument}
          onDeleteDocument={handleDeleteDocument}
          onReprocessDocument={handleReprocessDocument}
        />
      )}

      {/* List View */}
      {!isLoading && !error && viewMode === "list" && (
        <ListView
          files={filteredFiles}
          onChatWithDocument={handleChatWithDocument}
          onDeleteDocument={handleDeleteDocument}
          onReprocessDocument={handleReprocessDocument}
        />
      )}

      {/* Load More Button */}
      {hasMoreDocuments && !isLoading && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={loadMoreDocuments}
            variant="outline"
            className="bg-white/5 hover:bg-white/10"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Load More Documents
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredFiles.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-16">
          <div className="p-5 rounded-full bg-white/10 mb-4">
            <FolderOpen size={48} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">No documents found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
            {selectedCategory === "all"
              ? "You haven't uploaded any documents yet. Upload your first document to get started."
              : "No documents match your current filter. Try adjusting your search or upload a new file."}
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

        <div
          className="cursor-pointer"
          onClick={() => navigate("/dashboard/chats")}
        >
          <GlassCard className="p-4 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
                <MessageSquare size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold">Chat with Documents</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Start a conversation about your uploaded materials
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

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
