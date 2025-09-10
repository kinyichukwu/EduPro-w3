import { Button, Progress } from "@/shared/components/ui"
import { useState } from "react"
import { Book, Bookmark, Check, Glasses, Sparkles, UploadIcon, X } from "lucide-react"
import { GlassCard } from "../../GlassCard"

interface ProcessingOptionsProps {
  handleUpload: () => void
  uploadStatus: "idle" | "uploading" | "processing" | "success" | "error"
  uploadMethod: "file" | "url" | "youtube"
  selectedFile: File | null
  url: string
  uploadProgress: number
  title: string
  subject: string
}

export const ProcessingOptions = ({handleUpload, uploadStatus, uploadMethod, selectedFile, url, uploadProgress, title, subject}: ProcessingOptionsProps) => {
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [autoOcr, setAutoOcr] = useState(true);

  return (
    <GlassCard className="p-6 max-sm:px-4">
      <h2 className="text-lg font-bold mb-4">Processing Options</h2>

      <div className="space-y-4">
        <div className="flex items-start">
          <div className="flex h-5 items-center">
            <input
              id="auto-generate"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              checked={autoGenerate}
              onChange={() => setAutoGenerate(!autoGenerate)}
            />
          </div>
          <div className="ml-3 text-sm">
            <label
              htmlFor="auto-generate"
              className="font-medium text-gray-700 dark:text-gray-300"
            >
              Generate flashcards and quizzes
            </label>
            <p className="text-gray-500 dark:text-gray-400">
              Automatically extract key concepts to create study
              materials
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex h-5 items-center">
            <input
              id="auto-ocr"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              checked={autoOcr}
              onChange={() => setAutoOcr(!autoOcr)}
            />
          </div>
          <div className="ml-3 text-sm">
            <label
              htmlFor="auto-ocr"
              className="font-medium text-gray-700 dark:text-gray-300"
            >
              Text recognition (OCR)
            </label>
            <p className="text-gray-500 dark:text-gray-400">
              Extract text from images and scanned documents
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">Upload Quota</div>
          <div className="text-sm text-gray-500">3/5 this month</div>
        </div>
        <div className="w-full bg-gray-200/20 rounded-full h-2">
          <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 w-[60%]"></div>
        </div>
      </div>

      {/* AI Features */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-medium mb-3">
          AI Processing Features
        </h3>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-2 rounded-lg bg-purple-50/10 dark:bg-purple-900/5 border border-purple-100 dark:border-purple-900/20">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
              <Sparkles size={16} />
            </div>
            <div className="text-sm">
              <div className="font-medium text-purple-700 dark:text-purple-300">
                Smart Summarization
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Creates concise summaries of document content
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2 rounded-lg bg-blue-50/10 dark:bg-blue-900/5 border border-blue-100 dark:border-blue-900/20">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
              <Bookmark size={16} />
            </div>
            <div className="text-sm">
              <div className="font-medium text-blue-700 dark:text-blue-300">
                Key Concept Extraction
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Identifies important concepts for focused study
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2 rounded-lg bg-emerald-50/10 dark:bg-emerald-900/5 border border-emerald-100 dark:border-emerald-900/20">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
              <Glasses size={16} />
            </div>
            <div className="text-sm">
              <div className="font-medium text-emerald-700 dark:text-emerald-300">
                Enhanced Readability
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Improves document formatting for easier reading
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Status */}
      {uploadStatus !== "idle" && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-medium mb-3">
            {uploadStatus === "uploading"
              ? "Uploading..."
              : uploadStatus === "processing"
              ? "Processing..."
              : uploadStatus === "success"
              ? "Upload Complete"
              : "Upload Failed"}
          </h3>

          {uploadStatus === "uploading" && (
            <>
              <Progress value={uploadProgress} className="h-2 mb-2" />
              <p className="text-xs text-gray-500">
                {Math.round(uploadProgress)}% complete
              </p>
            </>
          )}

          {uploadStatus === "processing" && (
            <div className="flex items-center gap-2">
              <div className="animate-pulse">
                <Sparkles size={16} className="text-purple-500" />
              </div>
              <p className="text-xs text-gray-500">
                AI is processing your document...
              </p>
            </div>
          )}

          {uploadStatus === "success" && (
            <div className="flex items-center gap-2 text-emerald-500">
              <Check size={16} />
              <p className="text-sm">Document uploaded successfully!</p>
            </div>
          )}

          {uploadStatus === "error" && (
            <div className="flex items-center gap-2 text-red-500">
              <X size={16} />
              <p className="text-sm">
                Upload failed. Please try again.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <Button
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
          onClick={handleUpload}
          disabled={
            uploadStatus === "uploading" ||
            uploadStatus === "processing" ||
            (uploadMethod === "file" && !selectedFile) ||
            (uploadMethod === "url" && !url) ||
            !title ||
            !subject
          }
        >
          {uploadStatus === "idle" || uploadStatus === "error" ? (
            <>
              <UploadIcon size={16} className="mr-2" />
              Upload Document
            </>
          ) : uploadStatus === "success" ? (
            <>
              <Book size={16} className="mr-2" />
              View in Library
            </>
          ) : (
            <>Processing...</>
          )}
        </Button>

        {uploadStatus === "idle" && (
          <p className="text-xs text-center mt-2 text-gray-500">
            <span className="text-red-500">*</span> Required fields
          </p>
        )}
      </div>
    </GlassCard>
  )
}