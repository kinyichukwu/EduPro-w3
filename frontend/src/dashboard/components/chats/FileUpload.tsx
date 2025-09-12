import { useRef, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
// import { useToast } from '@/shared/hooks/use-toast';
import { Upload, FileText, X } from 'lucide-react';
import { ragService, type UploadResponse } from '@/services/rag';

interface FileUploadProps {
  chatId?: string;
  onUploaded?: (document: UploadResponse) => void;
  onProgress?: (percent: number) => void;
  disabled?: boolean;
  multiple?: boolean;
  className?: string;
}

interface SelectedFile {
  file: File;
  name: string;
  size: string;
  type: string;
}

export function FileUpload({ 
  chatId, 
  onUploaded, 
  onProgress, 
  disabled = false, 
  multiple = true,
  className = ""
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  // const { toast } = useToast();

  const VALID_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain'
  ];

  const VALID_EXTENSIONS = ['.pdf', '.docx', '.doc', '.txt'];

  const handleFileSelect = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles: SelectedFile[] = [];
    const invalidFiles: string[] = [];

    files.forEach(file => {
      // Check file type
      if (!VALID_TYPES.includes(file.type)) {
        invalidFiles.push(`${file.name} (unsupported type)`);
        return;
      }

      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        invalidFiles.push(`${file.name} (too large, max 50MB)`);
        return;
      }

      validFiles.push({
        file,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type
      });
    });

    if (invalidFiles.length > 0) {
      alert(`Invalid files: ${invalidFiles.join(', ')}`);
    }

    if (validFiles.length > 0) {
      if (multiple) {
        setSelectedFiles(prev => [...prev, ...validFiles]);
      } else {
        setSelectedFiles(validFiles.slice(0, 1));
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || uploading) return;

    setUploading(true);
    let successCount = 0;

    try {
      for (const selectedFile of selectedFiles) {
        const formData = new FormData();
        formData.append('file', selectedFile.file);

        try {
          const response = await ragService.uploadFile(
            formData,
            chatId,
            onProgress
          );

          onUploaded?.(response);
          successCount++;
        } catch (error) {
          console.error('Upload failed for', selectedFile.name, error);
          alert(`Upload failed for ${selectedFile.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (successCount > 0) {
        console.log(`Successfully uploaded ${successCount} file${successCount > 1 ? 's' : ''}`);
        setSelectedFiles([]);
      }
    } finally {
      setUploading(false);
      onProgress?.(0);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={className}>
      {/* File Selection */}
      <div className="flex items-center gap-1">
        <Button
          onClick={handleFileSelect}
          variant="outline"
          size="sm"
          disabled={disabled || uploading}
          className="flex items-center gap-1 h-9 px-3"
        >
          <Upload className="w-3 h-3" />
          {!multiple && selectedFiles.length === 0 ? 'Upload' : 'Select'}
        </Button>

        {selectedFiles.length > 0 && (
          <Button
            onClick={handleUpload}
            size="sm"
            disabled={uploading}
            className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 h-9 px-3"
          >
            {uploading ? '...' : `Upload ${selectedFiles.length}`}
          </Button>
        )}
      </div>

      {/* Selected Files Preview - Compact Inline Version */}
      {selectedFiles.length > 0 && !multiple && (
        <div className="flex items-center gap-2 px-2 py-1 bg-dark-card/40 rounded-md border border-white/10">
          <FileText className="w-3 h-3 text-turbo-purple flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-white truncate">{selectedFiles[0].name}</p>
          </div>
          {!uploading && (
            <Button
              onClick={() => removeFile(0)}
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white/60 hover:text-white"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      )}

      {/* Multiple Files Preview */}
      {selectedFiles.length > 0 && multiple && (
        <div className="mt-2 space-y-1">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-dark-card/40 rounded-md border border-white/10"
            >
              <FileText className="w-3 h-3 text-turbo-purple flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-white truncate">{file.name}</p>
              </div>

              {!uploading && (
                <Button
                  onClick={() => removeFile(index)}
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white/60 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={VALID_EXTENSIONS.join(',')}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
