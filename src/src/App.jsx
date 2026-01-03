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
  Cloud
} from 'lucide-react';

const apiKey = ""; // La clave se inyectará automáticamente

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
  { text: "La paz de Dios sobrepasa todo entendimiento.", ref: "Filipenses 4:7" }
];

export default function App() {
  const [selectedStyle, setSelectedStyle] = useState(THEME_STYLES[0]);
  const [currentVerse, setCurrentVerse] = useState(VERSES[0]);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Lógica para tiempo de Colombia (Bogotá)
    // Evita que el contenido cambie de día antes de tiempo después de las 6pm
    const getColombiaDate = () => {
      const bogotaTime = new Date().toLocaleString("en-US", { timeZone: "America/Bogota" });
      const date = new Date(bogotaTime);
      return date.getDate();
    };

    const day = getColombiaDate();
    setCurrentVerse(VERSES[day % VERSES.length]);
  }, []);

  const generateWallpaper = async () => {
    setLoading(true);
    try {
      const prompt = `Vertical mobile wallpaper, high resolution, 4k. ${selectedStyle.prompt}. No text, no people, minimalist spiritual aesthetic.`;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: { sampleCount: 1 }
        })
      });
      const data = await response.json();
      if (data.predictions?.[0]?.bytesBase64Encoded) {
        setGeneratedImageUrl(`data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
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
      <header className="w-full max-w-md p-6 flex justify-between items-center sticky top-0 z-20 bg-neutral-950/80 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-black italic text-amber-200">REFUGIO</h1>
          <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Bogotá, CO</p>
        </div>
        <div className="bg-neutral-900 p-2 rounded-xl border border-neutral-800">
          <Palette size={20} className="text-amber-200" />
        </div>
      </header>

      <main className="w-full max-w-md px-4 pb-20 flex flex-col gap-6">
        <div className="w-full aspect-[9/16] bg-neutral-900 rounded-[2.5rem] overflow-hidden relative border-4 border-neutral-800 shadow-2xl">
          {generatedImageUrl ? (
            <img src={generatedImageUrl} className="w-full h-full object-cover animate-fade-in" alt="Wallpaper" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center text-neutral-600">
              <ImageIcon size={48} className="mb-4" />
              <p className="text-sm">Elige un estilo y genera tu tema cristiano personalizado.</p>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black via-black/60 to-transparent">
            <h2 className="text-2xl font-serif italic mb-2 leading-tight">"{currentVerse.text}"</h2>
            <p className="text-xs font-bold text-amber-200 uppercase tracking-widest">{currentVerse.ref}</p>
          </div>

          {loading && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-2 border-amber-200 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase animate-pulse">Generando...</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
          {THEME_STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStyle(s)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl whitespace-nowrap text-xs font-bold transition-all border ${
                selectedStyle.id === s.id ? 'bg-amber-200 border-amber-200 text-black' : 'bg-neutral-900 border-neutral-800 text-neutral-400'
              }`}
            >
              {s.icon} {s.name}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button 
            onClick={generateWallpaper}
            disabled={loading}
            className="flex-1 h-16 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Generar Tema
          </button>
          <button 
            onClick={copyToClipboard}
            className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center active:scale-95 transition-all"
          >
            {copied ? <Check size={20} className="text-green-400" /> : <Share2 size={20} />}
          </button>
        </div>
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .animate-fade-in { animation: fadeIn 1s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

                
