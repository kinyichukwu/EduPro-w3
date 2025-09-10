import { motion } from "framer-motion";
import { FileText, Download, Eye, File, Image, Video, Music, Archive } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface FileData {
  name: string;
  type: string;
  size: string;
  url?: string;
}

interface FileMessageProps {
  files: FileData[];
  timestamp: string;
  isAI?: boolean;
  index: number;
}

const getFileIcon = (fileName: string, fileType: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (fileType.startsWith('image/')) {
    return <Image className="w-5 h-5" />;
  }
  
  if (fileType.startsWith('video/')) {
    return <Video className="w-5 h-5" />;
  }
  
  if (fileType.startsWith('audio/')) {
    return <Music className="w-5 h-5" />;
  }
  
  switch (extension) {
    case 'pdf':
      return <FileText className="w-5 h-5" />;
    case 'doc':
    case 'docx':
      return <FileText className="w-5 h-5" />;
    case 'zip':
    case 'rar':
    case '7z':
      return <Archive className="w-5 h-5" />;
    default:
      return <File className="w-5 h-5" />;
  }
};

const getFileColor = (fileName: string, fileType: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (fileType.startsWith('image/')) {
    return 'bg-green-500';
  }
  
  if (fileType.startsWith('video/')) {
    return 'bg-red-500';
  }
  
  if (fileType.startsWith('audio/')) {
    return 'bg-purple-500';
  }
  
  switch (extension) {
    case 'pdf':
      return 'bg-red-500';
    case 'doc':
    case 'docx':
      return 'bg-blue-500';
    case 'zip':
    case 'rar':
    case '7z':
      return 'bg-orange-500';
    default:
      return 'bg-gray-500';
  }
};

export const FileMessage: React.FC<FileMessageProps> = ({ 
  files, 
  timestamp, 
  isAI = false, 
  index 
}) => {
  const handleDownload = (file: FileData) => {
    if (file.url) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePreview = (file: FileData) => {
    if (file.url) {
      window.open(file.url, '_blank');
    }
  };

  return (
    <motion.div
      className={`flex ${isAI ? "justify-start" : "justify-end"} mb-4`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className={`max-w-[85%] ${isAI ? "order-2" : "order-1"}`}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3",
            isAI
              ? "bg-dark-card/80 backdrop-blur-lg border border-white/10 text-white"
              : "bg-gradient-to-r from-turbo-purple to-turbo-indigo text-white"
          )}
        >
          <div className="space-y-3">
            {files.map((file, fileIndex) => (
              <motion.div
                key={fileIndex}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg",
                  isAI 
                    ? "bg-white/5 border border-white/10" 
                    : "bg-white/10 border border-white/20"
                )}
                initial={{ opacity: 0, x: isAI ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 + fileIndex * 0.1 }}
              >
                {/* File Icon */}
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-white",
                  getFileColor(file.name, file.type)
                )}>
                  {getFileIcon(file.name, file.type)}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-white/60">{file.size}</span>
                    <span className="text-xs px-2 py-0.5 bg-white/10 rounded text-white/80">
                      {file.name.split('.').pop()?.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  {file.url && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(file)}
                        className="h-8 w-8 p-0 hover:bg-white/10 text-white/80 hover:text-white"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(file)}
                        className="h-8 w-8 p-0 hover:bg-white/10 text-white/80 hover:text-white"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Timestamp */}
        <div
          className={`flex items-center gap-2 mt-1 text-xs text-white/40 ${
            isAI ? "" : "justify-end"
          }`}
        >
          <span>{timestamp}</span>
        </div>
      </div>

      {/* AI Avatar */}
      {isAI && (
        <motion.div
          className="order-1 mr-3 mt-1"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.05 + 0.1 }}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-turbo-purple to-turbo-indigo flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
