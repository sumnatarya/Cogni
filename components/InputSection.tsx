import React, { useState, useRef, useEffect } from 'react';
import { FileText, UploadCloud, X, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { InputMode, FileData } from '../types';

interface InputSectionProps {
  onAnalyze: (text: string, file: FileData | null) => void;
  isAnalyzing: boolean;
  externalError: string | null;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'text/plain', 
  'application/pdf', 
  'image/jpeg', 
  'image/png', 
  'image/webp',
  'audio/mpeg', 
  'audio/wav', 
  'audio/x-m4a',
  'audio/mp4'
];

export const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, isAnalyzing, externalError }) => {
  const [mode, setMode] = useState<InputMode>(InputMode.TEXT);
  const [text, setText] = useState('');
  const [file, setFile] = useState<FileData | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync external errors to local state
  useEffect(() => {
    if (externalError) {
      setLocalError(externalError);
    }
  }, [externalError]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setLocalError(null);

    // 1. Check File Size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setLocalError("File is too large (Max 10MB). Please compress it or choose another.");
      return;
    }

    // 2. Check File Type
    if (!ALLOWED_MIME_TYPES.includes(selectedFile.type)) {
      setLocalError("Unsupported file type. Please upload PDF, Text, Images (JPG/PNG), or Audio (MP3/WAV).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFile({
        base64: result,
        mimeType: selectedFile.type,
        name: selectedFile.name
      });
    };
    reader.onerror = () => setLocalError("Failed to read file. It might be corrupted.");
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = () => {
    setLocalError(null);
    
    if (mode === InputMode.TEXT && text.trim().length < 10) {
      setLocalError("Text is too short. Please provide more content for a better analysis.");
      return;
    }

    if (mode === InputMode.FILE && !file) {
      setLocalError("Please upload a file first.");
      return;
    }

    if (!text && !file) {
      setLocalError("Please provide content to analyze.");
      return;
    }
    
    onAnalyze(text, file);
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setLocalError(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-100">
        <button
          onClick={() => { setMode(InputMode.TEXT); setLocalError(null); }}
          className={`flex-1 py-4 text-sm font-semibold transition-colors ${
            mode === InputMode.TEXT
              ? 'bg-brand-50 text-brand-600 border-b-2 border-brand-500'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          Paste Text
        </button>
        <button
          onClick={() => { setMode(InputMode.FILE); setLocalError(null); }}
          className={`flex-1 py-4 text-sm font-semibold transition-colors ${
            mode === InputMode.FILE
              ? 'bg-brand-50 text-brand-600 border-b-2 border-brand-500'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          Upload Content
        </button>
      </div>

      <div className="p-6">
        {mode === InputMode.TEXT ? (
          <textarea
            className="w-full h-48 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none transition-all outline-none text-slate-700 placeholder-slate-400"
            placeholder="Paste your study material, lecture notes, or article content here..."
            value={text}
            onChange={(e) => { setText(e.target.value); setLocalError(null); }}
            disabled={isAnalyzing}
          />
        ) : (
          <div className={`h-48 flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-colors relative ${
            file ? 'border-brand-200 bg-brand-50/30' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
          }`}>
             {!file && (
                 <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept={ALLOWED_MIME_TYPES.join(',')} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={isAnalyzing}
                />
             )}
            
            {file ? (
              <div className="flex flex-col items-center z-20 w-full px-4">
                <div className="bg-white p-3 rounded-full mb-3 text-brand-600 shadow-sm">
                  <FileText size={32} />
                </div>
                <p className="text-slate-900 font-medium truncate max-w-[250px]">{file.name}</p>
                <p className="text-xs text-brand-600 mt-1 font-medium flex items-center">
                   <CheckCircle className="w-3 h-3 mr-1" /> Ready
                </p>
                <button 
                    onClick={clearFile}
                    className="mt-4 text-xs text-red-500 hover:text-red-700 hover:underline z-30 cursor-pointer"
                >
                    Remove File
                </button>
              </div>
            ) : (
              <div className="text-center pointer-events-none p-4">
                <UploadCloud className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                <p className="text-sm font-medium text-slate-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
                  Supported: PDF, Images (JPG/PNG), Audio (MP3/WAV), Text
                </p>
              </div>
            )}
          </div>
        )}

        {localError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg flex items-start animate-fade-in">
             <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" /> 
             <span>{localError}</span>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isAnalyzing}
          className={`w-full mt-6 py-3.5 px-4 rounded-xl text-white font-medium shadow-lg shadow-brand-500/20 flex items-center justify-center transition-all transform active:scale-[0.99] ${
            isAnalyzing
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-brand-600 hover:bg-brand-500'
          }`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing & Generarting Plan...
            </>
          ) : (
            'Generate Study Plan'
          )}
        </button>
      </div>
    </div>
  );
};