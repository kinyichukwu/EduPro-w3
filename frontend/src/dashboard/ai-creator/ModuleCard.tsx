import { motion } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import { 
  BookOpen, 
  Edit3, 
  Trash2, 
  Calendar,
  Link as LinkIcon,
  CheckCircle,
  Clock,
  MoreVertical
} from "lucide-react";
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

interface ModuleCardProps {
  module: Module;
  onEdit: () => void;
  onDelete: () => void;
}

export const ModuleCard = ({ module, onEdit, onDelete }: ModuleCardProps) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusIcon = () => {
    return module.status === "completed" ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <Clock className="w-5 h-5 text-yellow-500" />
    );
  };

  const getStatusColor = () => {
    return module.status === "completed"
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  };

  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6 group hover:border-white/20 transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start gap-4">
            {/* Module Order */}
            <div className="flex-shrink-0 w-10 h-10 bg-turbo-purple/20 rounded-lg flex items-center justify-center">
              <span className="text-turbo-purple font-bold">{module.order}</span>
            </div>

            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-lg mb-1">
                    {module.title}
                  </h3>
                  <p className="text-white/60 text-sm line-clamp-2">
                    {module.description}
                  </p>
                </div>

                {/* Status Badge */}
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ml-4",
                  getStatusColor()
                )}>
                  {getStatusIcon()}
                  <span className="capitalize">{module.status}</span>
                </div>
              </div>

              {/* Content Preview */}
              {module.content && (
                <div className="mb-4">
                  <p className="text-white/50 text-sm line-clamp-2">
                    {module.content}
                  </p>
                </div>
              )}

              {/* Module Stats */}
              <div className="flex items-center gap-6 mb-4 text-sm text-white/60">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{module.content ? `${module.content.length} chars` : "No content"}</span>
                </div>
                
                {module.links.length > 0 && (
                  <div className="flex items-center gap-1">
                    <LinkIcon className="w-4 h-4" />
                    <span>{module.links.length} link{module.links.length !== 1 ? 's' : ''}</span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Updated {formatDate(module.updatedAt)}</span>
                </div>
              </div>

              {/* Links Preview */}
              {module.links.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {module.links.slice(0, 2).map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-turbo-purple/20 text-turbo-purple px-2 py-1 rounded-md hover:bg-turbo-purple/30 transition-colors"
                      >
                        {new URL(link).hostname}
                      </a>
                    ))}
                    {module.links.length > 2 && (
                      <span className="text-xs text-white/50 px-2 py-1">
                        +{module.links.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            onClick={onEdit}
            variant="ghost"
            size="sm"
            className="hover:bg-turbo-purple/20 text-turbo-purple hover:text-turbo-purple"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={onDelete}
            variant="ghost"
            size="sm"
            className="hover:bg-red-500/20 text-red-400 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-white/10 text-white/60 hover:text-white"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar for Draft Modules */}
      {module.status === "draft" && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-white/60">Module Progress</span>
            <span className="text-white/60">
              {module.content ? "50%" : "0%"}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-turbo-purple to-turbo-indigo h-2 rounded-full transition-all duration-300"
              style={{ width: module.content ? "50%" : "0%" }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};
