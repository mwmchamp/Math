export default function Status({ status }) {
  return (
    <div className="flex justify-center items-center mt-4">
      {status && (
        <div className="bg-indigo-800 bg-opacity-60 text-indigo-200 px-6 py-3 rounded-lg shadow-lg glow-md">
          <p>{status}</p>
        </div>
      )}
    </div>
  );
}
