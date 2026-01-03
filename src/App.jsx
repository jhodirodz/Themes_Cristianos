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

// Accedemos a la variable de entorno de forma segura
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
  { text: "Lámpara es a mis pies tu palabra.", ref: "Salmos 119:105" },
  { text: "El Señor es mi luz y mi salvación.", ref: "Salmos 27:1" },
  { text: "Si Dios es por nosotros, ¿quién contra nosotros?", ref: "Romanos 8:31" }
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
      // Configuración estricta para Colombia
      const now = new Date();
      const bogotaFormatter = new Intl.DateTimeFormat('es-CO', {
        timeZone: 'America/Bogota',
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        hour12: false
      });

      const parts = bogotaFormatter.formatToParts(now);
      const day = parseInt(parts.find(p => p.type === 'day').value);
      const hour = parseInt(parts.find(p => p.type === 'hour').value);
      
      // Mostrar la hora actual de Colombia en el UI
      const timeString = `${hour}:${parts.find(p => p.type === 'minute').value}`;
      setColombiaTime(timeString);

      /** * Lógica solicitada: Después de las 6 PM (18:00) NO pasar al día siguiente.
       * El índice se basa en el día actual de Colombia obtenido arriba.
       */
      setCurrentVerse(VERSES[day % VERSES.length]);
    };

    updateTimeAndVerse();
    const timer = setInterval(updateTimeAndVerse, 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchWithRetry = async (prompt, retries = 5, delay = 1000) => {
    if (!apiKey) throw new Error("API Key no configurada en Vercel.");
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: { sampleCount: 1 }
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 429 && retries > 0) {
          await new Promise(res => setTimeout(res, delay));
          return fetchWithRetry(prompt, retries - 1, delay * 2);
        }
        throw new Error(data.error?.message || "Error al generar imagen");
      }

      const result = await response.json();
      return `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
    } catch (err) {
      if (retries > 0) {
        await new Promise(res => setTimeout(res, delay));
        return fetchWithRetry(prompt, retries - 1, delay * 2);
      }
      throw err;
    }
  };

  const generateTheme = async () => {
    setLoading(true);
    setError(null);
    try {
      const prompt = `Vertical mobile wallpaper 9:16. ${selectedStyle.prompt}. Spiritual christian theme, peaceful, no text, 4k resolution.`;
      const imageUrl = await fetchWithRetry(prompt);
      setGeneratedImageUrl(imageUrl);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const text = `${currentVerse.text} - ${currentVerse.ref}`;
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center selection:bg-amber-500/30">
      {/* Header con Reloj Colombia */}
      <header className="w-full max-w-md p-6 flex justify-between items-center sticky top-0 z-20 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-900">
        <div>
          <h1 className="text-xl font-black italic text-amber-300 tracking-tighter">REFUGIO</h1>
          <div className="flex items-center gap-1.5 text-neutral-500">
            <Clock size={10} />
            <p className="text-[9px] font-bold uppercase tracking-widest">Bogotá {colombiaTime}</p>
          </div>
        </div>
        <div className="bg-neutral-900 p-2 rounded-xl border border-neutral-800">
          <Palette size={20} className="text-amber-300" />
        </div>
      </header>

      <main className="w-full max-w-md px-4 pb-24 flex flex-col gap-6 mt-4">
        {/* Mobile Preview */}
        <div className="w-full aspect-[9/16] bg-neutral-900 rounded-[3rem] overflow-hidden relative border-4 border-neutral-800 shadow-2xl transition-all duration-500">
          {generatedImageUrl ? (
            <img src={generatedImageUrl} className="w-full h-full object-cover animate-fade-in" alt="Wallpaper" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center text-neutral-700">
              <ImageIcon size={64} className="mb-4 opacity-10" />
              <p className="text-sm font-medium opacity-50">Elige un estilo y genera tu fondo cristiano.</p>
            </div>
          )}

          {/* Versículo Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black via-black/80 to-transparent">
            <h2 className="text-2xl font-serif italic mb-3 leading-tight drop-shadow-xl text-white">
              "{currentVerse.text}"
            </h2>
            <p className="text-xs font-bold text-amber-300 uppercase tracking-[0.2em]">
              {currentVerse.ref}
            </p>
          </div>

          {loading && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-10">
              <div className="w-12 h-12 border-2 border-amber-300 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-amber-300 animate-pulse">Inspirando Tema...</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 bg-red-950/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center gap-4 z-10">
              <AlertCircle size={40} className="text-red-400" />
              <p className="text-xs font-bold text-red-200 uppercase tracking-widest">Error de Seguridad o Conexión</p>
              <p className="text-sm text-red-300/80">{error}</p>
              <button onClick={() => setError(null)} className="px-6 py-2 bg-red-800 rounded-full text-[10px] font-bold uppercase">Cerrar</button>
            </div>
          )}
        </div>

        {/* Styles Selector */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
          {THEME_STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStyle(s)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl whitespace-nowrap text-xs font-bold transition-all border ${
                selectedStyle.id === s.id 
                  ? 'bg-amber-300 border-amber-300 text-black shadow-lg shadow-amber-900/20 scale-105' 
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
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
            className="flex-[3] h-16 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Generar Apariencia
          </button>
          <button 
            onClick={copyToClipboard}
            className="flex-1 h-16 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center active:scale-95 transition-all group"
          >
            {copied ? <Check size={22} className="text-green-400" /> : <Share2 size={22} className="group-hover:text-amber-300 transition-colors" />}
          </button>
        </div>
      </main>

      <footer className="mt-auto p-6 opacity-30 text-[9px] font-bold uppercase tracking-[0.3em]">
        Gloria a Dios • 2025
      </footer>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .animate-fade-in { animation: fadeIn 1.2s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(1.05); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}

