
import React, { useState, useCallback, useRef } from 'react';
import { analyzeChartImage, getMentorResponse } from './services/geminiService';
import { AnalysisResult, ChatMessage, ZoneType } from './types';
import Sidebar from './components/Sidebar';
import ChartDisplay from './components/ChartDisplay';
import ChatBox from './components/ChatBox';

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setAnalysis(null);
    setChatHistory([]);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setImage(base64);
      try {
        const result = await analyzeChartImage(base64);
        setAnalysis(result);
        setChatHistory([{
          role: 'model',
          text: `Gráfico analizado. He detectado ${result.zones.length} zonas de interés. Mi consejo: ${result.mentorAdvice}`
        }]);
      } catch (err) {
        console.error(err);
        setChatHistory([{ role: 'model', text: "No pude procesar la imagen adecuadamente. Intenta con un gráfico más claro." }]);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const resetAnalysis = () => {
    setImage(null);
    setAnalysis(null);
    setChatHistory([]);
  };

  const onSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: message }];
    setChatHistory(newHistory);
    setLoading(true);

    try {
      // Prepare history for Gemini API
      const apiHistory = newHistory.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await getMentorResponse(apiHistory, message);
      if (response) {
        setChatHistory([...newHistory, { role: 'model', text: response }]);
      }
    } catch (err) {
      setChatHistory([...newHistory, { role: 'model', text: "Error de comunicación con el Mentor." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0c] text-zinc-100 overflow-hidden">
      {/* Sidebar for Navigation/Zones */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        analysis={analysis} 
        onUpload={handleImageUpload}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-[#0a0a0c]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-zinc-800 rounded-md transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span className="text-emerald-500">Liquid.AI</span>
              <span className="text-zinc-500 text-sm font-normal">| El Rastreador Institucional</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
             {image && !loading && (
               <button 
                 onClick={resetAnalysis}
                 className="text-xs font-bold text-zinc-400 hover:text-white transition-colors bg-zinc-800/50 hover:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700"
               >
                 NUEVA CAPTURA
               </button>
             )}
             {loading && (
               <div className="flex items-center gap-2 text-emerald-400 text-xs animate-pulse">
                 <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                 PROCESANDO...
               </div>
             )}
          </div>
        </header>

        {/* Viewport: Chart and Chat Split */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Chart Display Area */}
          <div className="flex-[2] border-r border-zinc-800 overflow-hidden flex flex-col">
            <ChartDisplay image={image} analysis={analysis} loading={loading} onUpload={handleImageUpload} />
          </div>

          {/* Mentor Chat Area */}
          <div className="flex-1 min-w-[320px] max-w-full lg:max-w-md xl:max-w-lg bg-[#0e0e10] flex flex-col shadow-2xl">
            <ChatBox 
              messages={chatHistory} 
              onSendMessage={onSendMessage} 
              loading={loading}
              hasImage={!!image}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
