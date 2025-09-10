import { fileTypeMap } from "@/dashboard/library/uploads";
import { GlassCard } from "../../GlassCard"
import { motion } from "framer-motion";
import { Download, MoreHorizontal, FileText, Share2, Star } from "lucide-react";
import { Button } from "@/shared/components/ui";


interface ListViewProps {
  files: {
    id: number,
    name: string,
    type: string,
    category: string,
    size: string,
    tags: string[],
    lastModified: string,
    starred: boolean,
    thumbnail: null,
  }[]
}

export const ListView = ({files}: ListViewProps) => {
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

  return(
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <GlassCard className="p-0 overflow-hidden">
        <div className="grid grid-cols-12 py-3 px-4 bg-white/10 dark:bg-white/5 text-sm font-medium">
          <div className="col-span-6">Name</div>
          <div className="col-span-2">Size</div>
          <div className="col-span-2">Last Modified</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {files.map((file) => (
            <motion.div
              key={file.id}
              variants={itemVariants}
              className="grid grid-cols-12 py-3 px-4 items-center hover:bg-white/5 transition-colors"
            >
              <div className="col-span-6 flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    fileTypeMap[file.type as keyof typeof fileTypeMap]
                      ?.color || "bg-gray-100 dark:bg-gray-800/40"
                  }`}
                >
                  {fileTypeMap[file.type as keyof typeof fileTypeMap]
                    ?.icon || (
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
                  </div>
                </div>
              </div>

              <div className="col-span-2 text-sm text-gray-500">
                {file.size}
              </div>

              <div className="col-span-2 text-sm text-gray-500">
                {file.lastModified}
              </div>

              <div className="col-span-2 flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-gray-200/20"
                >
                  <Download size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-gray-200/20"
                >
                  <Share2 size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-gray-200/20"
                >
                  <MoreHorizontal size={16} />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  )
}