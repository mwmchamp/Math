import { useState } from 'react';

export default function UploadForm({ onSubmit }) {
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ image, text });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-indigo-300">Upload Image</label>
        <input
          type="file"
          onChange={handleImageChange}
          className="mt-1 p-2 block w-full bg-gray-900 text-indigo-200 border border-indigo-500 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-indigo-300">Enter Math Text</label>
        <textarea
          placeholder="Enter math equation or description..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mt-1 p-2 block w-full bg-gray-900 text-indigo-200 border border-indigo-500 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
          rows={3}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 text-white px-4 py-2 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
      >
        Generate Video
      </button>
    </form>
  );
}
