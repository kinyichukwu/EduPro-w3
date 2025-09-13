import { fileTypeMap } from "@/dashboard/library/uploads";
import { GlassCard } from "../../GlassCard";
import { motion } from "framer-motion";
import {
  Download,
  MoreHorizontal,
  FileText,
  Share2,
  Star,
  MessageSquare,
  Trash2,
  RefreshCw,
  AlertCircle,
  Loader2,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/shared/components/ui";
import { FileItem } from "./types";

interface ListViewProps {
  files: FileItem[];
  onChatWithDocument?: (documentId: string, title: string) => void;
  onDeleteDocument?: (documentId: string, title: string) => void;
  onReprocessDocument?: (documentId: string, title: string) => void;
}

export const ListView = ({
  files,
  onChatWithDocument,
  onDeleteDocument,
  onReprocessDocument,
}: ListViewProps) => {
  // Animation variants
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
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <GlassCard className="p-0 overflow-hidden">
        <div className="grid grid-cols-12 py-3 px-4 bg-white/10 dark:bg-white/5 text-sm font-medium">
          <div className="col-span-5">Name</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Size</div>
          <div className="col-span-2">Last Modified</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {files.map((file) => (
            <motion.div
              key={file.id}
              variants={itemVariants}
              className="grid grid-cols-12 py-3 px-4 items-center hover:bg-white/5 transition-colors"
            >
              <div className="col-span-5 flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    fileTypeMap[file.type as keyof typeof fileTypeMap]?.color ||
                    "bg-gray-100 dark:bg-gray-800/40"
                  }`}
                >
                  {fileTypeMap[file.type as keyof typeof fileTypeMap]?.icon || (
                    <FileText size={20} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="font-medium flex items-center gap-1">
                    {file.name}
                    {file.starred && (
                      <Star
                        size={14}
                        className="fill-yellow-400 text-yellow-400"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    {file.tags.map((tag, idx) => (
                      <span key={idx}>
                        {tag}
                        {idx < file.tags.length - 1 ? ", " : ""}
                      </span>
                    ))}
                    {file.error && (
                      <span
                        className="text-red-500 truncate"
                        title={file.error}
                      >
                        Error: {file.error}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                {file.processing_status && (
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
                )}
              </div>

              <div className="col-span-2 text-sm text-gray-500">
                {file.size}
              </div>

              <div className="col-span-2 text-sm text-gray-500">
                {file.lastModified}
              </div>

              <div className="col-span-1 flex items-center justify-end gap-1">
                {onChatWithDocument &&
                  file.document_id &&
                  file.processing_status === "completed" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-blue-500/10 hover:text-blue-400"
                      onClick={() =>
                        onChatWithDocument(file.document_id!, file.name)
                      }
                      title="Chat with this document"
                    >
                      <MessageSquare size={16} />
                    </Button>
                  )}
                {file.processing_status === "failed" &&
                  onReprocessDocument &&
                  file.document_id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-orange-500/10 hover:text-orange-400"
                      onClick={() =>
                        onReprocessDocument(file.document_id!, file.name)
                      }
                      title="Reprocess document"
                    >
                      <RefreshCw size={16} />
                    </Button>
                  )}
                {file.source_url && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-gray-200/20"
                    onClick={() => window.open(file.source_url, "_blank")}
                    title="View document"
                  >
                    <Download size={16} />
                  </Button>
                )}
                {onDeleteDocument && file.document_id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-red-500/10 hover:text-red-400"
                    onClick={() =>
                      onDeleteDocument(file.document_id!, file.name)
                    }
                    title="Delete document"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
};
