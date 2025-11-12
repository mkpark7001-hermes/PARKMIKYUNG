export interface GeneratedTextContent {
  planningIntention: string;
  englishPrompt: string;
  keywords: string[];
}

export interface GeneratedContent extends GeneratedTextContent {
  imageUrl: string;
}
