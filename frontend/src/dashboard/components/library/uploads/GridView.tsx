import {
  Clock,
  Download,
  FileText,
  MessageSquare,
  Pencil,
  Share2,
  Star,
  Tag,
  Trash2,
  RefreshCw,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui";
import { motion } from "framer-motion";
import { fileTypeMap } from "@/dashboard/library/uploads";
import { GlassCard } from "../../GlassCard";
import { FileItem } from "./types";

interface GridViewProps {
  files: FileItem[];
  onChatWithDocument?: (documentId: string, title: string) => void;
  onDeleteDocument?: (documentId: string, title: string) => void;
  onReprocessDocument?: (documentId: string, title: string) => void;
}

export const GridView = ({
  files,
  onChatWithDocument,
  onDeleteDocument,
  onReprocessDocument,
}: GridViewProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {files.map((file) => (
        <motion.div
          key={file.id}
          variants={itemVariants}
          whileHover={{ y: -5 }}
          className="group"
        >
          <GlassCard className="p-0 overflow-hidden transition-all">
            {/* File Preview Area */}
            <div
              className={`aspect-[4/3] flex items-center justify-center relative ${
                fileTypeMap[file.type as keyof typeof fileTypeMap]?.color ||
                "bg-gray-100 dark:bg-gray-800/40"
              }`}
            >
              {fileTypeMap[file.type as keyof typeof fileTypeMap]?.icon || (
                <FileText size={48} className="text-gray-400" />
              )}

              {/* Processing Status Indicator */}
              {file.processing_status && (
                <div className="absolute top-2 right-2">
                  {file.processing_status === "processing" && (
                    <div className="bg-blue-500 text-white p-1 rounded-full">
                      <Loader2 size={16} className="animate-spin" />
                    </div>
                  )}
                  {file.processing_status === "completed" && (
                    <div className="bg-green-500 text-white p-1 rounded-full">
                      <CheckCircle size={16} />
                    </div>
                  )}
                  {file.processing_status === "failed" && (
                    <div className="bg-red-500 text-white p-1 rounded-full">
                      <AlertCircle size={16} />
                    </div>
                  )}
                  {file.processing_status === "queued" && (
                    <div className="bg-yellow-500 text-white p-1 rounded-full">
                      <Clock size={16} />
                    </div>
                  )}
                </div>
              )}

              {/* Quick Actions Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {file.source_url && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full bg-white/20 text-white hover:bg-white/30"
                    onClick={() => window.open(file.source_url, "_blank")}
                  >
                    <Download size={18} />
                  </Button>
                )}
                {file.processing_status === "failed" &&
                  onReprocessDocument &&
                  file.document_id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full bg-white/20 text-white hover:bg-white/30"
                      onClick={() =>
                        onReprocessDocument(file.document_id!, file.name)
                      }
                    >
                      <RefreshCw size={18} />
                    </Button>
                  )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-white/20 text-white hover:bg-white/30"
                >
                  <Star
                    size={18}
                    className={
                      file.starred ? "fill-yellow-400 text-yellow-400" : ""
                    }
                  />
                </Button>
                {onDeleteDocument && file.document_id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    onClick={() =>
                      onDeleteDocument(file.document_id!, file.name)
                    }
                  >
                    <Trash2 size={18} />
                  </Button>
                )}
              </div>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-medium truncate" title={file.name}>
                  {file.name.length > 25
                    ? `${file.name.substring(0, 22)}...`
                    : file.name}
                </h3>
                {file.starred && (
                  <Star
                    size={16}
                    className="fill-yellow-400 text-yellow-400 flex-shrink-0 ml-1"
                  />
                )}
              </div>

              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{file.lastModified}</span>
                </div>
                <span>{file.size}</span>
              </div>

              {/* Processing Status */}
              {file.processing_status && (
                <div className="mt-2">
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      file.processing_status === "completed"
                        ? "bg-green-100/50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : file.processing_status === "processing"
                        ? "bg-blue-100/50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : file.processing_status === "failed"
                        ? "bg-red-100/50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-yellow-100/50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {file.processing_status === "processing" && (
                      <Loader2 size={10} className="animate-spin" />
                    )}
                    {file.processing_status === "completed" && (
                      <CheckCircle size={10} />
                    )}
                    {file.processing_status === "failed" && (
                      <AlertCircle size={10} />
                    )}
                    {file.processing_status === "queued" && <Clock size={10} />}
                    <span className="capitalize">{file.processing_status}</span>
                  </div>
                  {file.error && (
                    <p
                      className="text-xs text-red-500 mt-1 line-clamp-2"
                      title={file.error}
                    >
                      {file.error}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-1">
                {file.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100/50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                  >
                    <Tag size={10} className="mr-1" /> {tag}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3">
                <div className="flex gap-2">
                  {onChatWithDocument &&
                    file.document_id &&
                    file.processing_status === "completed" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 hover:bg-blue-500/10 hover:text-blue-400"
                        onClick={() =>
                          onChatWithDocument(file.document_id!, file.name)
                        }
                      >
                        <MessageSquare size={14} className="mr-1" /> Chat
                      </Button>
                    )}
                  {file.processing_status === "failed" &&
                    onReprocessDocument &&
                    file.document_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 hover:bg-orange-500/10 hover:text-orange-400"
                        onClick={() =>
                          onReprocessDocument(file.document_id!, file.name)
                        }
                      >
                        <RefreshCw size={14} className="mr-1" /> Retry
                      </Button>
                    )}
                  {file.source_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => window.open(file.source_url, "_blank")}
                    >
                      <Download size={14} className="mr-1" /> View
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </motion.div>
  );
};
