export default function VideoDisplay({ videoUrl }) {
  return (
    <div className="text-center">
      {videoUrl ? (
        <div className="space-y-4">
          <video controls src={videoUrl} className="w-full max-w-xl mx-auto rounded-lg shadow-lg" />
          <div className="flex justify-center space-x-4">
            <a href={videoUrl} download className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600">Download</a>
            <button onClick={() => navigator.share({ url: videoUrl })} className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600">Share</button>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">No video available</p>
      )}
    </div>
  );
}
