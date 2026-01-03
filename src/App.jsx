import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Download, 
  RefreshCw, 
  Sparkles, 
  Image as ImageIcon,
  Check,
  Share2,
  Heart,
  Shield,
  Cloud,
  AlertCircle,
  Clock
} from 'lucide-react';

// Variable de entorno de Vite para Vercel
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

const THEME_STYLES = [
  { id: 'paz', name: 'Paz', icon: <Cloud size={18} />, prompt: 'heavenly peace, soft clouds, biblical atmosphere, blue and white tones' },
  { id: 'fortaleza', name: 'Fortaleza', icon: <Shield size={18} />, prompt: 'strong rock, majestic mountains, solid faith, golden hour lighting' },
  { id: 'amor', name: 'Amor', icon: <Heart size={18} />, prompt: 'divine love, warm light, soft textures, rose and cream colors' },
  { id: 'luz', name: 'Luz', icon: <Sparkles size={18} />, prompt: 'divine light, bright morning, hope, high contrast spiritual art' }
];

const VERSES = [
  { text: "Jehová es mi pastor; nada me faltará.", ref: "Salmos 23:1" },
  { text: "Todo lo puedo en Cristo que me fortalece.", ref: "Filipenses 4:13" },
  { text: "No temas, porque yo estoy contigo.", ref: "Isaías 41:10" },
  { text: "La paz de Dios sobrepasa todo entendimiento.", ref: "Filipenses 4:7" },
  { text: "Lámpara es a mis pies tu palabra.", ref: "Salmos 119:105" }
];

export default function App() {
  const [selectedStyle, setSelectedStyle] = useState(THEME_STYLES[0]);
  const [currentVerse, setCurrentVerse] = useState(VERSES[0]);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [colombiaTime, setColombiaTime] = useState("");

  useEffect(() => {
    const updateTimeAndVerse = () => {
      // Obtenemos la hora exacta de Colombia
      const options = { 
        timeZone: "America/Bogota", 
        hour: 'numeric', 
        minute: 'numeric',
        day: 'numeric',
        hour12: false 
      };
      
      const formatter = new Intl.DateTimeFormat('en-US', options);
      const parts = formatter.formatToParts(new Date());
      
      const day = parseInt(parts.find(p => p.type === 'day').value);
      const hour = parseInt(parts.find(p => p.type === 'hour').value);
      const minute = parts.find(p => p.type === 'minute').value;
      
      setColombiaTime(`${hour}:${minute}`);

      // Lógica: Mantiene el día actual de Colombia.
      // Esto evita que después de las 6:00 PM (18:00) cambie al día siguiente prematuramente
      setCurrentVerse(VERSES[day % VERSES.length]);
    };

    updateTimeAndVerse();
    const timer = setInterval(updateTimeAndVerse, 60000);
    return () => clearInterval(timer);
  }, []);

  const generateTheme = async () => {
    if (!apiKey) {
      setError("Error: No se encontró la API Key en Vercel (VITE_GEMINI_API_KEY).");
      return;
    }

    setLoading(true);
    setError(null);

    const promptText = `A vertical 9:16 high-resolution mobile wallpaper. ${selectedStyle.prompt}. Clean, minimalist, christian spiritual aesthetic. No text, no words.`;

    try {
      // Endpoint corregido según especificación
      const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: { prompt: promptText },
          parameters: { sampleCount: 1 }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Error al conectar con la IA.");
      }

      const data = await response.json();
      
      if (data.predictions && data.predictions[0].bytesBase64Encoded) {
        const base64Image = `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
        setGeneratedImageUrl(base64Image);
      } else {
        throw new Error("La IA no devolvió ninguna imagen. Intenta con otro estilo.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error desconocido al generar.");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImageUrl) return;
    
    try {
      // Convertimos Base64 a Blob para mejor soporte en móviles
      const byteString = atob(generatedImageUrl.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: 'image/png' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `tema-cristiano-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError("No se pudo descargar automáticamente. Intenta dejando presionada la imagen.");
    }
  };

  const copyVerse = () => {
    const text = `${currentVerse.text} - ${currentVerse.ref}`;
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center">
      <header className="w-full max-w-md p-6 flex justify-between items-center sticky top-0 z-20 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-900">
        <div>
          <h1 className="text-xl font-black italic text-amber-300">REFUGIO</h1>
          <div className="flex items-center gap-1 text-neutral-500">
            <Clock size={10} />
            <p className="text-[9px] font-bold uppercase tracking-widest">Colombia {colombiaTime}</p>
          </div>
        </div>
        <div className="bg-neutral-900 p-2 rounded-xl border border-neutral-800">
          <Palette size={20} className="text-amber-300" />
        </div>
      </header>

      <main className="w-full max-w-md px-4 pb-24 flex flex-col gap-6 mt-4">
        {/* Mobile Viewport Preview */}
        <div className="w-full aspect-[9/16] bg-neutral-900 rounded-[2.5rem] overflow-hidden relative border-4 border-neutral-800 shadow-2xl transition-all duration-700">
          {generatedImageUrl ? (
            <img src={generatedImageUrl} className="w-full h-full object-cover animate-fade-in" alt="Wallpaper" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center text-neutral-700 gap-4">
              <ImageIcon size={48} className="opacity-20" />
              <p className="text-sm font-medium opacity-50">Selecciona un estilo y genera tu fondo cristiano.</p>
            </div>
          )}

          {/* Versículo Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black via-black/50 to-transparent">
            <h2 className="text-2xl font-serif italic leading-tight mb-3 drop-shadow-md">"{currentVerse.text}"</h2>
            <p className="text-xs font-bold text-amber-300 uppercase tracking-widest">{currentVerse.ref}</p>
          </div>

          {/* Cargando */}
          {loading && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-10">
              <div className="w-10 h-10 border-2 border-amber-300 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-amber-300 animate-pulse">Creando Tema...</p>
            </div>
          )}

          {/* Error UI */}
          {error && (
            <div className="absolute inset-0 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center gap-4 z-10">
              <AlertCircle size={40} className="text-red-400" />
              <p className="text-sm font-bold text-red-200">{error}</p>
              <button onClick={() => setError(null)} className="px-6 py-2 bg-red-800 rounded-full text-xs font-bold uppercase">Reintentar</button>
            </div>
          )}
        </div>

        {/* Style Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
          {THEME_STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStyle(s)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl whitespace-nowrap text-xs font-bold transition-all border ${
                selectedStyle.id === s.id 
                  ? 'bg-amber-300 border-amber-300 text-black shadow-lg shadow-amber-900/20' 
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400'
              }`}
            >
              {s.icon} {s.name}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={generateTheme}
            disabled={loading}
            className="flex-[2] h-16 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Generar Apariencia
          </button>
          
          {generatedImageUrl && (
            <button 
              onClick={downloadImage}
              className="w-16 h-16 bg-amber-300 text-black rounded-2xl flex items-center justify-center active:scale-95 transition-all shadow-lg shadow-amber-900/40"
            >
              <Download size={22} />
            </button>
          )}

          <button 
            onClick={copyVerse}
            className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center active:scale-95 transition-all"
          >
            {copied ? <Check size={22} className="text-green-400" /> : <Share2 size={22} />}
          </button>
        </div>
      </main>

      <footer className="mt-auto p-8 opacity-20 text-[9px] font-bold uppercase tracking-[0.4em]">
        Refugio Cristiano • 2026
      </footer>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .animate-fade-in { animation: fadeIn 1.5s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

