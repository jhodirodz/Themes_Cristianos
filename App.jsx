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

const apiKey = ""; // La clave se inyectará automáticamente en el entorno

const THEME_STYLES = [
  { id: 'minimalist', name: 'Paz', icon: <Cloud size={18} />, prompt: 'minimalist christian aesthetic, soft pastel blues and whites, morning light, spiritual peace' },
  { id: 'nature', name: 'Fortaleza', icon: <Shield size={18} />, prompt: 'majestic mountains, cedar trees, solid rock, biblical atmosphere, dawn lighting' },
  { id: 'modern', name: 'Amor', icon: <Heart size={18} />, prompt: 'abstract heart shapes, warm sunlight through clouds, rose gold and cream colors, divine love' },
  { id: 'vintage', name: 'Luz', icon: <Sparkles size={18} />, prompt: 'glowing light in darkness, golden rays, elegant spiritual radiance, cinematic depth' }
];

const VERSES = [
  { text: "Jehová es mi pastor; nada me faltará.", ref: "Salmos 23:1" },
  { text: "Todo lo puedo en Cristo que me fortalece.", ref: "Filipenses 4:13" },
  { text: "El amor sea sin fingimiento.", ref: "Romanos 12:9" },
  { text: "No temas, porque yo estoy contigo.", ref: "Isaías 41:10" },
  { text: "La paz de Dios sobrepasa todo entendimiento.", ref: "Filipenses 4:7" }
];

export default function App() {
  const [selectedStyle, setSelectedStyle] = useState(THEME_STYLES[0]);
  const [currentVerse, setCurrentVerse] = useState(VERSES[0]);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [copied, setCopied] = useState(false);

  // Lógica de tiempo específica para Colombia (Bogotá)
  useEffect(() => {
    const updateVerse = () => {
      // Forzamos la zona horaria de Bogotá
      const bogotaTime = new Date().toLocaleString("en-US", { timeZone: "America/Bogota" });
      const now = new Date(bogotaTime);
      const day = now.getDate();
      // El versículo cambia según el día del mes
      setCurrentVerse(VERSES[day % VERSES.length]);
    };

    updateVerse();
    const timer = setInterval(updateVerse, 60000); // Revisar cada minuto
    return () => clearInterval(timer);
  }, []);

  const generateTheme = async () => {
    setLoading(true);
    setStatus('Inspirándonos...');
    try {
      const promptText = `High quality mobile wallpaper, vertical 9:16. ${selectedStyle.prompt}. Clean, no text, no faces, highly spiritual and aesthetic.`;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: promptText }],
          parameters: { sampleCount: 1 }
        })
      });

      const data = await response.json();
      if (data.predictions?.[0]?.bytesBase64Encoded) {
        setGeneratedImageUrl(`data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`);
        setStatus('¡Tema listo!');
      } else {
        throw new Error('Error en generación');
      }
    } catch (error) {
      setStatus('Error al conectar. Reintenta.');
    } finally {
      setLoading(false);
    }
  };

  const copyVerse = () => {
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
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col items-center">
      {/* App Bar */}
      <nav className="w-full max-w-md p-6 flex justify-between items-center bg-neutral-950/50 backdrop-blur-lg sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-black tracking-tighter text-amber-200 italic">REFUGIO</h1>
          <p className="text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase">Colombia Ed.</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-neutral-900 rounded-xl border border-neutral-800">
            <Palette size={20} className="text-amber-200" />
          </button>
        </div>
      </nav>

      <main className="w-full max-w-md flex-1 px-4 pb-24 flex flex-col gap-6">
        {/* Mobile Viewport Preview */}
        <div className="w-full aspect-[9/16] bg-neutral-900 rounded-[3rem] overflow-hidden relative border-4 border-neutral-800 shadow-2xl transition-all duration-700">
          {generatedImageUrl ? (
            <img src={generatedImageUrl} className="w-full h-full object-cover animate-in fade-in duration-1000" alt="Wallpaper" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center text-neutral-600 gap-4">
              <ImageIcon size={48} />
              <p className="text-sm">Selecciona un estilo y genera tu fondo cristiano personalizado.</p>
            </div>
          )}

          {/* Versículo Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black via-black/40 to-transparent">
            <h2 className="text-2xl font-serif italic leading-tight mb-3">"{currentVerse.text}"</h2>
            <p className="text-xs font-bold text-amber-200 tracking-[0.2em] uppercase">{currentVerse.ref}</p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-10">
              <div className="w-10 h-10 border-2 border-amber-200 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold tracking-widest animate-pulse uppercase">{status}</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {THEME_STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStyle(s)}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl whitespace-nowrap text-xs font-bold transition-all border ${
                  selectedStyle.id === s.id 
                    ? 'bg-amber-200 border-amber-200 text-black' 
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                }`}
              >
                {s.icon} {s.name}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button 
              onClick={generateTheme}
              disabled={loading}
              className="flex-[2] h-16 bg-white text-black rounded-[1.5rem] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Generar Apariencia
            </button>
            <button 
              onClick={copyVerse}
              className="flex-1 h-16 bg-neutral-900 border border-neutral-800 rounded-[1.5rem] flex items-center justify-center active:scale-95 transition-transform"
            >
              {copied ? <Check size={20} className="text-green-400" /> : <Share2 size={20} />}
            </button>
          </div>
        </div>
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-in { animation: fade-in 1s ease-out forwards; }
      `}</style>
    </div>
  );
}

