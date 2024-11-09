export default function Status({ status }) {
  return (
    <div className="flex justify-center items-center mt-4">
      {status && (
        <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg shadow-md">
          <p>{status}</p>
        </div>
      )}
    </div>
  );
}
