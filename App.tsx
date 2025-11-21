import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { ResultsDashboard } from './components/ResultsDashboard';
import { analyzeContent } from './services/geminiService';
import { LearningAnalysis, FileData } from './types';

const STORAGE_KEY = 'cogniplan_last_result';

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<LearningAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load data from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setAnalysisResult(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved plan", e);
      }
    }
  }, []);

  const handleAnalyze = async (text: string, file: FileData | null) => {
    setIsAnalyzing(true);
    setErrorMsg(null); // Clear previous errors
    
    try {
      const result = await analyzeContent(text, file);
      setAnalysisResult(result);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    } catch (error: any) {
      console.error("App Error:", error);
      
      // Map error codes to user-friendly messages
      if (error.message === "MISSING_API_KEY") {
        setErrorMsg("Configuration Error: API Key is missing. Please check your environment settings.");
      } else if (error.message === "INVALID_API_KEY") {
        setErrorMsg("Access Denied: The provided API Key is invalid or expired.");
      } else if (error.message === "BAD_REQUEST") {
         setErrorMsg("The content provided could not be processed. Please try shorter text or a different file.");
      } else {
        setErrorMsg("An unexpected error occurred while communicating with the AI. Please try again.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-4 tracking-tight">
            Master Anything. <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-blue-600">Scientifically.</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Upload your learning materials. We'll use AI to calculate the optimal study time and generate a spaced repetition schedule tailored to how your brain actually learns.
          </p>
        </div>

        {/* Input Section */}
        <div className="mb-12">
          <InputSection 
            onAnalyze={handleAnalyze} 
            isAnalyzing={isAnalyzing} 
            externalError={errorMsg}
          />
        </div>

        {/* Results Section */}
        {analysisResult && (
          <div id="results" className="scroll-mt-20">
             <div className="flex items-center mb-6">
               <div className="h-px bg-slate-200 flex-1"></div>
               <span className="px-4 text-sm font-medium text-slate-400 uppercase tracking-widest">Your Optimized Plan</span>
               <div className="h-px bg-slate-200 flex-1"></div>
             </div>
             <h3 className="text-2xl font-display font-bold text-slate-800 mb-6 text-center">
               Learning Plan: {analysisResult.topic}
             </h3>
            <ResultsDashboard data={analysisResult} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;