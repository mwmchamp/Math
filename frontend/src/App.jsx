import { useState } from 'react';
import UploadForm from './components/UploadForm';
import Status from './components/Status';
import VideoDisplay from './components/VideoDisplay';

export default function App() {
  const [status, setStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const handleSubmit = async ({ image, text }) => {
    setStatus('Generating your video...');
    const formData = new FormData();
    formData.append('image', image);
    formData.append('text', text);

    try {
      const response = await fetch('http://127.0.0.1:5000/generate-video', {
        method: 'GET',
      });
      const data = await response.json();
      setVideoUrl(data.videoUrl);
      setStatus('');
    } catch (error) {
      setStatus('Error generating video. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8 bg-gray-800 bg-opacity-75 shadow-xl rounded-lg p-8 text-white border border-indigo-500">
        <h1 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600 glow-md">Math Video Generator</h1>
        <p className="text-center text-indigo-300 mb-4">Upload an image or enter math text to generate an AI-powered video.</p>

        <UploadForm onSubmit={handleSubmit} />
        <Status status={status} />
        {videoUrl && (
          <div className="mt-8">
            <VideoDisplay videoUrl={videoUrl} />
          </div>
        )}
      </div>
    </div>
  );
}
