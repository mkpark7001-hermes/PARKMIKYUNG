import React, { useState, useCallback } from 'react';
import { generateTextContent, generateImage } from './services/geminiService';
import { DRAWING_STYLES } from './constants';
import { GeneratedContent } from './types';
import { Button } from './components/Button';
import { Spinner } from './components/Spinner';
import { GeneratedContentDisplay } from './components/GeneratedContentDisplay';

const App: React.FC = () => {
  const [subject, setSubject] = useState<string>('');
  const [style, setStyle] = useState<string>(DRAWING_STYLES[0]);
  const [hasBackground, setHasBackground] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!subject.trim()) {
      setError("Please enter a subject.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const textData = await generateTextContent(subject, style, hasBackground);
      const imageUrl = await generateImage(textData.englishPrompt);
      
      setGeneratedContent({
        ...textData,
        imageUrl,
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [subject, style, hasBackground]);

  const handleDownload = () => {
    if (!generatedContent?.imageUrl) return;

    const link = document.createElement('a');
    link.href = generatedContent.imageUrl;
    // Generate a filename from the subject
    const filename = subject.trim().toLowerCase().replace(/\s+/g, '-').slice(0, 30) || 'generated-image';
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <main className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Stock Image Hermesbox
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            AI-powered image generation for your creative projects.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-blue-300">1. Describe Your Image</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                  주제 (Subject)
                </label>
                <textarea
                  id="subject"
                  rows={4}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="e.g., a cat reading a book in a cozy library"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="style" className="block text-sm font-medium text-gray-300 mb-2">
                  그림 스타일 (Drawing Style)
                </label>
                <select
                  id="style"
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                >
                  {DRAWING_STYLES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between bg-gray-900 p-3 rounded-lg border border-gray-600">
                <span className="text-sm font-medium text-gray-300">배경 유무 (Background)</span>
                <label htmlFor="background-toggle" className="inline-flex relative items-center cursor-pointer">
                  <input type="checkbox" id="background-toggle" className="sr-only peer" checked={hasBackground} onChange={() => setHasBackground(!hasBackground)} />
                  <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isLoading || !subject.trim()}
              className="w-full mt-8 text-lg"
            >
              {isLoading ? 'Generating...' : 'Generate Image'}
            </Button>
            {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
          </div>

          {/* Output Panel */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 min-h-[500px] flex flex-col">
            <h2 className="text-2xl font-bold mb-6 text-blue-300">2. Generated Result</h2>
            <div className="flex-grow">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Spinner />
                  <p className="mt-4 text-gray-400">Generating your masterpiece...</p>
                </div>
              ) : (
                <GeneratedContentDisplay 
                  content={generatedContent} 
                  onDownload={handleDownload}
                  hasBackground={hasBackground}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
