export interface ILegalDocumentSummary {
  id: string;
  legalDocumentId: string;
  summarisedText?: string;
  summarizedTitle?: string;
  keywords?: string[];
  processingStatus: LegalDocumentProcessingStatus;
}

export enum LegalDocumentProcessingStatus {
  NOT_STARTED,
  PROCESSING,
  COMPLETE,
}
