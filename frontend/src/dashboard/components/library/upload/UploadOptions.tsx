import { Dispatch, SetStateAction, useState } from "react";
import {
  Check,
  ChevronDown,
  Cloud,
  FileText,
  Image as ImageIcon,
  InfoIcon,
  Link2,
  Upload as UploadIcon,
  X,
  Youtube,
} from "lucide-react";
import { Button, Input } from "@/shared/components/ui";
import { GlassCard } from "../../GlassCard";

interface UploadOptionsProps {
  url: string,
  setUrl: Dispatch<SetStateAction<string>>
  title: string,
  setTitle: Dispatch<SetStateAction<string>>
  subject: string,
  setSubject: Dispatch<SetStateAction<string>>
  uploadMethod: "file" | "url" | "youtube"
  setUploadMethod: Dispatch<SetStateAction<"file" | "url" | "youtube">>
  selectedFile: File | null
  setSelectedFile: Dispatch<SetStateAction<File | null>>
}

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Literature",
  "History",
];

export const UploadOptions = ({url, setUrl, title, setTitle, subject, setSubject, uploadMethod, setUploadMethod, selectedFile, setSelectedFile}: UploadOptionsProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [description, setDescription] = useState("");

  // Handle file selection via input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  // Handle tag input
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Get icon based on file type
  const getFileIcon = () => {
    if (!selectedFile) return <FileText className="text-blue-500" size={32} />;

    const fileType = selectedFile.type.split("/")[0];
    if (fileType === "image") {
      return <ImageIcon className="text-emerald-500" size={32} />;
    } else if (fileType === "video") {
      return <Youtube className="text-red-500" size={32} />;
    } else if (fileType === "audio") {
      return <FileText className="text-amber-500" size={32} />;
    } else {
      return <FileText className="text-blue-500" size={32} />;
    }
  };

  return (
    <div className="lg:col-span-2">
      <GlassCard className="p-6 max-sm:px-4">
        {/* Upload Method Selection */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-4">Upload Method</h2>
          <div className="flex border-b border-gray-200 dark:border-gray-800">
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                uploadMethod === "file"
                  ? "border-purple-500 text-purple-600 dark:text-purple-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              onClick={() => setUploadMethod("file")}
            >
              Upload File
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                uploadMethod === "url"
                  ? "border-purple-500 text-purple-600 dark:text-purple-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              onClick={() => setUploadMethod("url")}
            >
              From URL
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                uploadMethod === "youtube"
                  ? "border-purple-500 text-purple-600 dark:text-purple-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              onClick={() => setUploadMethod("youtube")}
            >
              YouTube
            </button>
          </div>
        </div>

        {/* File Upload Area */}
        {uploadMethod === "file" && (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? "border-purple-500 bg-purple-50/10"
                : "border-gray-300 dark:border-gray-700 hover:border-purple-400"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="flex flex-col items-center">
                <div className="p-4 bg-gray-100 dark:bg-gray-800/40 rounded-full mb-3">
                  {getFileIcon()}
                </div>
                <div className="font-medium mb-1">
                  {selectedFile.name}
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </div>
                <Button
                  variant="outline"
                  className="border-red-500/50 hover:border-red-500 text-red-500 text-xs"
                  onClick={() => setSelectedFile(null)}
                >
                  <X size={14} className="mr-1" /> Remove File
                </Button>
              </div>
            ) : (
              <>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                  <UploadIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  Drop your file here
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  PDF, DOCX, PPTX, JPG, PNG (max. 25MB)
                </p>
                <label>
                  <Button className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
                    Select File
                  </Button>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.doc,.pptx,.ppt,.jpg,.jpeg,.png"
                  />
                </label>
              </>
            )}
          </div>
        )}

        {/* URL Input */}
        {uploadMethod === "url" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <InfoIcon size={16} />
              <span>
                Enter a web URL to a document, article, or webpage
              </span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  placeholder="https://example.com/document"
                  className="pl-10 w-full"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <Button className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
                Fetch
              </Button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4 mt-4">
              <h4 className="font-medium mb-2 flex items-center">
                <Cloud size={16} className="mr-2 text-purple-500" />
                Web Document Features
              </h4>
              <ul className="text-sm text-gray-500 space-y-2">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500" />
                  Automatically extracts content from web pages
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500" />
                  Strips ads and formatting for clean reading
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500" />
                  Saves a permanent copy to your library
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* YouTube Input */}
        {uploadMethod === "youtube" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <InfoIcon size={16} />
              <span>
                Enter a YouTube video URL to process its content
              </span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Youtube
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500"
                  size={18}
                />
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  className="pl-10 w-full"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <Button className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
                Process
              </Button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4 mt-4">
              <h4 className="font-medium mb-2 flex items-center">
                <Youtube size={16} className="mr-2 text-red-500" />
                YouTube Features
              </h4>
              <ul className="text-sm text-gray-500 space-y-2">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500" />
                  Automatically transcribes video content
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500" />
                  Creates timestamps for key points
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500" />
                  Generates summary notes
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Document Details Form */}
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4">Document Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Document title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full max-sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  className="w-full rounded-md border border-gray-300 dark:border-input bg-white dark:bg-background py-2 pl-3 pr-10 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 appearance-none"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  <option value="">Select a subject</option>
                  {subjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                className="w-full rounded-md border border-gray-300 dark:border-input bg-white dark:bg-background py-2 px-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="Add a brief description (optional)"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <Input
                placeholder="Add tags (press Enter to add)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-full max-sm:text-sm"
              />
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}