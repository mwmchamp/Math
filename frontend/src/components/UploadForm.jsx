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
        <label className="block text-sm font-medium text-gray-700">Upload Image</label>
        <input type="file" onChange={handleImageChange} className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Enter Math Text</label>
        <textarea
          placeholder="Enter math equation or description..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          rows={3}
        />
      </div>

      <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Generate Video</button>
    </form>
  );
}
