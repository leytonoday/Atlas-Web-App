export interface ICreateLegalDocumentsRequest {
  documents: ICreateLegalDocument[];
}

export interface ICreateLegalDocument {
  mimeType: string;
  base64Data: string;
  fileName: string;
}
