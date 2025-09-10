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
} from "lucide-react";
import { Button } from "@/shared/components/ui";
import { motion } from "framer-motion";
import { fileTypeMap } from "@/dashboard/library/uploads";
import { GlassCard } from "../../GlassCard";
import { FileItem } from "./types";

interface GridViewProps {
  files: FileItem[];
  onChatWithDocument?: (documentId: string, title: string) => void;
}

export const GridView = ({files, onChatWithDocument}: GridViewProps) => {
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

              {/* Quick Actions Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-white/20 text-white hover:bg-white/30"
                >
                  <Download size={18} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-white/20 text-white hover:bg-white/30"
                >
                  <Share2 size={18} />
                </Button>
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-white/20 text-white hover:bg-white/30"
                >
                  <Trash2 size={18} />
                </Button>
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
                  {onChatWithDocument && file.document_id && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 hover:bg-blue-500/10 hover:text-blue-400"
                      onClick={() => onChatWithDocument(file.document_id!, file.name)}
                    >
                      <MessageSquare size={14} className="mr-1" /> Chat
                    </Button>
                  )}
                  {file.source_url && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2"
                      onClick={() => window.open(file.source_url, '_blank')}
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
  )
}