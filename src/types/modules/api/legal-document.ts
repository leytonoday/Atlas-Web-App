export interface ILegalDocument {
  id: string;
  name: string;
  fullText: string;
  language: string;
  createdOnUtc: Date;
  mimeType: string;
}
