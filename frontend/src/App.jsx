import { useState } from 'react';
import UploadForm from '../components/UploadForm';
import Status from '../components/Status';
import VideoDisplay from '../components/VideoDisplay';

export default function App() {
  const [status, setStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const handleSubmit = async ({ image, text }) => {
    setStatus('Generating your video...');
    const formData = new FormData();
    formData.append('image', image);
    formData.append('text', text);

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setVideoUrl(data.videoUrl);
      setStatus('');
    } catch (error) {
      setStatus('Error generating video. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8 bg-white shadow-lg rounded-lg p-8 text-gray-900">
        <h1 className="text-3xl font-extrabold text-center text-indigo-700 mb-6">Math Video Generator</h1>
        <p className="text-center text-gray-600 mb-4">Upload an image or enter math text to generate an AI-powered video.</p>
        
        {/* Upload Form */}
        <UploadForm onSubmit={handleSubmit} />

        {/* Status Message */}
        <Status status={status} />

        {/* Video Display */}
        {videoUrl && (
          <div className="mt-8">
            <VideoDisplay videoUrl={videoUrl} />
          </div>
        )}
      </div>
    </div>
  );
}
