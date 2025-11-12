import React from 'react';
import { GeneratedContent } from '../types';
import { Button } from './Button';

interface GeneratedContentDisplayProps {
  content: GeneratedContent | null;
  onDownload: () => void;
  hasBackground: boolean;
}

const ContentCard: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold text-blue-400 mb-2">{title}</h3>
        {children}
    </div>
);


export const GeneratedContentDisplay: React.FC<GeneratedContentDisplayProps> = ({ content, onDownload, hasBackground }) => {
  if (!content) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>Your generated content will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className={`rounded-lg overflow-hidden border-2 border-gray-700 ${!hasBackground ? 'checkerboard-bg' : ''}`}>
          <img src={content.imageUrl} alt="Generated" className="w-full h-auto object-contain" />
        </div>
        <Button onClick={onDownload} className="w-full mt-4">
          Download PNG
        </Button>
      </div>
      
      <ContentCard title="기획 의도 (Planning Intention)">
        <p className="text-gray-300">{content.planningIntention}</p>
      </ContentCard>

      <ContentCard title="영어 이미지 프롬프트 (English Prompt)">
        <p className="text-gray-300 font-mono text-sm break-words">{content.englishPrompt}</p>
      </ContentCard>

      <ContentCard title="키워드 추천 (Keywords)">
        <div className="flex flex-wrap gap-2">
          {content.keywords.map((keyword, index) => (
            <span key={index} className="bg-gray-700 text-blue-300 text-sm font-medium px-3 py-1 rounded-full">
              {keyword}
            </span>
          ))}
        </div>
      </ContentCard>
    </div>
  );
};
