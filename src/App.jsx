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
  AlertCircle
} from 'lucide-react';

// IMPORTANTE: Para Vercel, puedes poner tu clave aquí o usar variables de entorno
const apiKey = ""; 

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

  useEffect(() => {
    const updateTimeAndVerse = () => {
      // Lógica de tiempo de Colombia (Bogotá)
      const options = { timeZone: "America/Bogota", hour: 'numeric', day: 'numeric' };
      const bogotaParts = new Intl.DateTimeFormat('en-US', options).formatToParts(new Date());
      
      const day = parseInt(bogotaParts.find(p => p.type === 'day').value);
      const hour = parseInt(bogotaParts.find(p => p.type === 'hour').value);
      
      // Si quieres que después de las 6 PM (18:00) NO pase al día siguiente en el contenido:
      // La lógica de 'day' ya nos da el día actual en Colombia. 
      // El versículo se basa en ese número de día.
      setCurrentVerse(VERSES[day % VERSES.length]);
    };

    updateTimeAndVerse();
    const timer = setInterval(updateTimeAndVerse, 60000);
    return () => clearInterval(timer);
  }, []);

  // Función con Backoff Exponencial para la API de Imagen
  const fetchWithRetry = async (prompt, retries = 5, delay = 1000) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
    const payload = {
      instances: { prompt },
      parameters: { sampleCount: 1 }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Error ${response.status}`);
      }

      const data = await response.json();
      if (data.predictions?.[0]?.bytesBase64Encoded) {
        return `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
      }
      throw new Error("No se recibió imagen del servidor");
    } catch (err) {
      if (retries > 0) {
        await new Promise(res => setTimeout(res, delay));
        return fetchWithRetry(prompt, retries - 1, delay * 2);
      }
      throw err;
    }
  };

  const generateWallpaper = async () => {
    if (!apiKey) {
      setError("Falta la API Key. Configúrala en el código.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const prompt = `Mobile wallpaper 9:16 aspect ratio. ${selectedStyle.prompt}. Spiritual christian theme, peaceful, artistic, high definition 4k. No text.`;
      const imageUrl = await fetchWithRetry(prompt);
      setGeneratedImageUrl(imageUrl);
    } catch (e) {
      console.error(e);
      setError("No pudimos generar la imagen. Intenta de nuevo en unos segundos.");
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
      <header className="w-full max-w-md p-6 flex justify-between items-center sticky top-0 z-20 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-900">
        <div>
          <h1 className="text-xl font-black italic text-amber-300 tracking-tighter">REFUGIO</h1>
          <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Colombia • Bogotá</p>
        </div>
        <div className="bg-neutral-900 p-2 rounded-xl border border-neutral-800">
          <Palette size={20} className="text-amber-300" />
        </div>
      </header>

      <main className="w-full max-w-md px-4 pb-24 flex flex-col gap-6 mt-4">
        {/* Visualización del Tema */}
        <div className="w-full aspect-[9/16] bg-neutral-900 rounded-[3rem] overflow-hidden relative border-4 border-neutral-800 shadow-2xl">
          {generatedImageUrl ? (
            <img src={generatedImageUrl} className="w-full h-full object-cover animate-fade-in" alt="Wallpaper" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center text-neutral-600">
              <ImageIcon size={56} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">Selecciona un estilo y genera tu fondo de pantalla.</p>
            </div>
          )}

          {/* Versículo dinámico */}
          <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black via-black/70 to-transparent">
            <h2 className="text-2xl font-serif italic mb-3 leading-tight text-white drop-shadow-md">
              "{currentVerse.text}"
            </h2>
            <p className="text-xs font-bold text-amber-300 uppercase tracking-widest">
              {currentVerse.ref}
            </p>
          </div>

          {/* Estados de Carga y Error */}
          {loading && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-10">
              <div className="w-12 h-12 border-2 border-amber-300 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-amber-300 animate-pulse">Creando Tema...</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center gap-4 z-10">
              <AlertCircle size={40} className="text-red-400" />
              <p className="text-sm font-bold text-red-200">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="px-6 py-2 bg-red-800 rounded-full text-xs font-bold"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>

        {/* Botones de Estilo */}
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

        {/* Acciones principales */}
        <div className="flex gap-3">
          <button 
            onClick={generateWallpaper}
            disabled={loading}
            className="flex-1 h-16 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-[0.1em] flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Generar Tema
          </button>
          <button 
            onClick={copyToClipboard}
            className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center active:scale-95 transition-all"
          >
            {copied ? <Check size={22} className="text-green-400" /> : <Share2 size={22} />}
          </button>
        </div>
      </main>

      <footer className="mt-auto p-6 text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
        Inspiración Cristiana • Colombia
      </footer>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .animate-fade-in { animation: fadeIn 1s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

