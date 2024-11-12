import Post from './components/Post';
import { useState } from 'react';
import UploadForm from './components/UploadForm';
import Status from './components/Status';
import VideoDisplay from './components/VideoDisplay';

export default function App() {
  const [status, setStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [generationsLeft, setGenerationsLeft] = useState(2);

  const handleSubmit = async ({ image, text }) => {
    setVideoUrl('')
    if (generationsLeft <= 0) {
      setStatus('Generation limit reached.');
      setGenerationsLeft(-1)
      return;
    }

    setStatus('Generating your video...');
    const formData = new FormData();
    formData.append('image', image);
    formData.append('text', text);

    try {
      const response = await fetch('http://localhost:5000/generate-video', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setVideoUrl(data.videoUrl);
      setStatus('');
      setGenerationsLeft(prev => prev - 1);
    } catch (error) {
      setStatus('Error generating video. Please try again.');
      console.error('Error:', error);
    }
  };

  return (
    generationsLeft < 0 ? (
      <Post generationsLeft={generationsLeft} setGenerationsLeft={setGenerationsLeft} />
    ) : (
      <div className="min-h-screen bg-black text-white">
        <nav className="fixed w-full top-0 z-50 bg-[#0a0a0a] border-b border-white/[0.06]">
          <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between">
            <span className="text-lg font-medium tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              ∇ CrystalMath ∇
            </span>
            <span className="text-sm text-zinc-500">
              {generationsLeft} generations remaining
            </span>
          </div>
        </nav>

        <main className="pt-28 px-6 pb-16">
          <div className="max-w-2xl mx-auto space-y-16">
            <header className="text-center space-y-4">
              <h1 className="text-6xl font-medium tracking-tight">
                Crystal Math
              </h1>
              <p className="text-base text-zinc-500">
                Generate AI-powered visualizations from mathematical concepts
              </p>
            </header>

            <div className="bg-[#111111] rounded-xl p-8">
              <UploadForm onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* <div className="space-y-2">
                    <label className="block text-sm text-zinc-400">Upload Image</label>
                    <input 
                      type="file"
                      accept="image/*"
                      className="w-full h-12 px-4 bg-[#0a0a0a] rounded-lg border border-white/[0.06] text-sm text-zinc-300 
                      file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm 
                      file:bg-white/[0.05] file:text-zinc-300 hover:file:bg-white/[0.08]"
                    />
                  </div> */}

                  <div className="space-y-2">
                    <label className="block text-sm text-zinc-400">Enter Math Text</label>
                    <textarea 
                      className="w-full h-32 px-4 py-3 bg-[#0a0a0a] rounded-lg border border-white/[0.06] 
                      text-sm text-zinc-300 placeholder-zinc-600 resize-none focus:outline-none 
                      focus:ring-1 focus:ring-white/[0.12]"
                      placeholder="Try 'Integral from 0 to 1 of 5*x^2' or 'Double Integral from 0 to 1 and 0 to 1 of x^2 + y^2 dy dx'"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg 
                    text-sm font-medium transition-all hover:opacity-90 focus:outline-none 
                    focus:ring-2 focus:ring-purple-500/50"
                  >
                    Generate Video
                  </button>
                </div>
              </UploadForm>

              {status && (
                <div className="mt-4 text-center text-sm text-zinc-500">
                  {status}
                </div>
              )}
            </div>

            {videoUrl && (
              <div className="bg-[#111111] rounded-xl p-8">
                <VideoDisplay videoUrl={videoUrl} />
              </div>
            )}
          </div>
        </main>

        <footer className="fixed bottom-0 w-full border-t border-white/[0.06] bg-[#0a0a0a]">
          <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-center">
            <span className="text-xs text-zinc-500">
              Powered by advanced AI technology
            </span>
          </div>
        </footer>
      </div>
    )
  );
}
