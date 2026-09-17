import { useRef, useState } from "react";

type UploadDocumentsProps = {
  setActivePage: (page: string) => void;
};

const UploadDocuments = ({
  setActivePage,
}: UploadDocumentsProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] =
    useState("GST");
  const [uploading, setUploading] =
    useState(false);
  const [message, setMessage] =
    useState("");

  const handleFile = (
    selectedFile: File | undefined
  ) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a document first.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();

      formData.append("bidder_id", "5");
      formData.append(
        "document_type",
        documentType
      );
      formData.append("file", file);

      const response = await fetch(
        "http://127.0.0.1:8000/documents/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || "Upload failed"
        );
      }

      setMessage(
        "Document uploaded successfully."
      );

      setFile(null);

    } catch (error) {

      setMessage(
        error instanceof Error
          ? error.message
          : "Upload failed."
      );

    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>

          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Bidder Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-950">
            Upload Documents
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Submit required documents for compliance verification.
          </p>

        </div>

        <button
          onClick={() =>
            setActivePage("VerificationStatus")
          }
          className="text-sm font-semibold text-blue-600"
        >
          Verification Status →
        </button>

      </header>


      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_0.85fr]">

        {/* UPLOAD AREA */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-5">

            <h2 className="text-lg font-bold text-slate-950">
              Submit a document
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Upload PDF, JPG or PNG documents.
            </p>

          </div>


          <div className="mb-5">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Document Type
            </label>

            <select
              value={documentType}
              onChange={(e) =>
                setDocumentType(e.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400"
            >
              <option value="GST">
                GST Certificate
              </option>

              <option value="PAN">
                PAN Card
              </option>

              <option value="UDYAM">
                Udyam / MSME
              </option>

              <option value="ITR">
                Income Tax Return
              </option>

              <option value="COMPANY_REGISTRATION">
                Company Registration
              </option>

              <option value="FINANCIAL_STATEMENTS">
                Financial Statements
              </option>
            </select>

          </div>


          <div
            onClick={() =>
              fileInputRef.current?.click()
            }
            onDragOver={(e) =>
              e.preventDefault()
            }
            onDrop={(e) => {
              e.preventDefault();
              handleFile(e.dataTransfer.files?.[0]);
            }}
            className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center transition hover:border-blue-300 hover:bg-blue-50/40"
          >

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl text-blue-600">
              ↑
            </div>

            <h3 className="mt-5 text-base font-bold text-slate-800">
              Drag and drop files here
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              or
            </p>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="mt-3 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Choose Files
            </button>

            <p className="mt-4 text-xs text-slate-400">
              Supported formats: PDF, JPG, PNG
            </p>

          </div>


          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) =>
              handleFile(e.target.files?.[0])
            }
          />


          {file && (

            <div className="mt-4 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600">
                  ▤
                </div>

                <div>

                  <p className="max-w-xs truncate text-sm font-semibold text-slate-800">
                    {file.name}
                  </p>

                  <p className="text-xs text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>

                </div>

              </div>

              <button
                onClick={() => setFile(null)}
                className="text-xs font-semibold text-rose-600"
              >
                Remove
              </button>

            </div>

          )}


          {message && (

            <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
              {message}
            </p>

          )}


          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {uploading
              ? "Uploading..."
              : "Upload Document"}
          </button>

        </section>


        {/* REQUIRED DOCUMENTS */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-lg font-bold text-slate-950">
                Required Documents
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Complete your compliance profile.
              </p>

            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
              0 / 6
            </span>

          </div>


          <div className="mt-6 space-y-3">

            {[
              "GST Certificate",
              "PAN Card",
              "Udyam / MSME",
              "Company Registration",
              "Income Tax Return",
              "Financial Statements",
            ].map((name) => (

              <div
                key={name}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3"
              >

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-400">
                  ○
                </div>

                <div className="flex-1">

                  <p className="text-sm font-medium text-slate-700">
                    {name}
                  </p>

                  <p className="text-[10px] text-slate-400">
                    Not uploaded
                  </p>

                </div>

                <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-600">
                  Pending
                </span>

              </div>

            ))}

          </div>

        </section>

      </div>

    </div>
  );
};

export default UploadDocuments;