// // src/types/technical-doc.ts

export interface TechnicalDoc {
  id: string;
  doc_type: string;
  title: string;
  url: string;
  version?: string;
  file_size?: number;
  thumbnail_url?: string;
  description?: string;
}
