export interface FileItem {
  id: string | number;
  name: string;
  type: string;
  category: string;
  size: string;
  tags: string[];
  lastModified: string;
  starred: boolean;
  thumbnail: null;
  source_url?: string;
  document_id?: string;
  processing_status?: string;
  error?: string | null;
}
