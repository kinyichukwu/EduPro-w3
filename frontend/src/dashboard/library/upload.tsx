import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { ProcessingOptions, UploadOptions } from "../components/library/upload";

export default function UploadNew() {
  const navigate = useNavigate();
  const [uploadMethod, setUploadMethod] = useState<"file" | "url" | "youtube">(
    "file"
  );
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "processing" | "success" | "error"
  >("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  // Simulate file upload
  const handleUpload = () => {
    if (
      (uploadMethod === "file" && !selectedFile) ||
      (uploadMethod === "url" && !url) ||
      !title ||
      !subject
    ) {
      return; // Validation failed
    }

    setUploadStatus("uploading");

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        clearInterval(interval);
        progress = 100;
        setUploadProgress(100);
        setUploadStatus("processing");

        // Simulate processing time
        setTimeout(() => {
          setUploadStatus("success");
        }, 1500);
      } else {
        setUploadProgress(progress);
      }
    }, 500);
  };

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
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-transparent bg-clip-text">
            Upload New Document
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Add study materials to your library for easy access and AI-powered
            features
          </p>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Upload Options */}
          <UploadOptions
            url={url}
            setUrl={setUrl}
            title={title}
            setTitle={setTitle}
            subject={subject}
            setSubject={setSubject}
            uploadMethod={uploadMethod}
            setUploadMethod={setUploadMethod}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
          />

          {/* Right Side - Processing Options & Upload */}
          <ProcessingOptions
            uploadStatus={uploadStatus} 
            uploadMethod={uploadMethod} 
            handleUpload={handleUpload} 
            selectedFile={selectedFile}
            url={url}
            uploadProgress={uploadProgress}
            title={title}
            subject={subject}
          />
        </div>
      </motion.div>
    </div>
  );
}
