import { useState } from "react";

const UploadDocuments = ({
  setActivePage,
}: {
  setActivePage: (page: string) => void;
}) => {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">
            BIDDER PORTAL
          </p>

          <h1 className="text-3xl font-bold text-gray-900">
            Upload Documents
          </h1>

          <p className="mt-1 text-gray-500">
            Submit compliance documents for verification.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActivePage("Dashboard")}
          className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Upload Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-2 text-xl font-semibold">
          Upload Compliance Document
        </h2>

        <p className="mb-6 text-sm text-gray-500">
          Upload a PDF or document required for bid verification.
        </p>

        {/* File Input */}
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-10 text-center hover:bg-gray-50">
          <div className="mb-3 text-4xl">📄</div>

          <p className="font-medium text-gray-800">
            Click to select a document
          </p>

          <p className="mt-1 text-sm text-gray-500">
            PDF, DOC, DOCX
          </p>

          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0] || null;
              setFile(selectedFile);
            }}
          />
        </label>

        {/* Selected File */}
        {file && (
          <div className="mt-5 flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div>
              <p className="font-medium text-gray-800">
                {file.name}
              </p>

              <p className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        )}

        {/* Upload Button */}
        <button
          type="button"
          disabled={!file}
          className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          Upload Document
        </button>
      </div>
    </div>
  );
};

export default UploadDocuments;