import { useRef, useState } from "react";

type UploadDocumentsProps = {
  setActivePage: (page: string) => void;
};

type VerificationResult = {
  verification_status?: string;
  score?: number | null;
  risk_level?: string | null;
  issues?: string | null;
  ai_recommendation?: string | null;
};

const UploadDocuments = ({
  setActivePage,
}: UploadDocumentsProps) => {
  const API =
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000";

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [file, setFile] =
    useState<File | null>(null);

  const [documentType, setDocumentType] =
    useState("GST");

  const [uploading, setUploading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [processingStatus, setProcessingStatus] =
    useState("");

  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);

  // =========================================
  // FILE SELECTION
  // =========================================

  const handleFile = (
    selectedFile: File | undefined
  ) => {
    if (!selectedFile) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setMessage(
        "Please upload a PDF, JPG or PNG file."
      );
      return;
    }

    // 10 MB limit
    if (
      selectedFile.size >
      10 * 1024 * 1024
    ) {
      setMessage(
        "File size must be less than 10 MB."
      );
      return;
    }

    setFile(selectedFile);
    setMessage("");
    setProcessingStatus("");
    setVerificationResult(null);
  };

  // =========================================
  // CHECK DOCUMENT STATUS
  // =========================================

  const checkDocumentStatus = async (
    documentId: number
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `${API}/documents/${documentId}/status`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to check document status."
        );
      }

      const status = data?.status;

      setProcessingStatus(status);

      // -------------------------------
      // COMPLETED
      // -------------------------------

      if (status === "COMPLETED") {
        setVerificationResult(
          data?.verification_result || null
        );

        setMessage(
          "Document verification completed."
        );

        return true;
      }

      // -------------------------------
      // FAILED
      // -------------------------------

      if (status === "FAILED") {
        setMessage(
          "Document verification failed. Please try again."
        );

        return true;
      }

      // -------------------------------
      // UNSUPPORTED
      // -------------------------------

      if (status === "UNSUPPORTED") {
        setMessage(
          "Automatic verification is not available for this document type yet."
        );

        return true;
      }

      // Still processing
      return false;

    } catch (error) {
      console.error(
        "Status check error:",
        error
      );

      return false;
    }
  };

  // =========================================
  // STATUS POLLING
  // =========================================

  const startStatusPolling = (
    documentId: number
  ) => {
    const poll = async () => {
      const completed =
        await checkDocumentStatus(
          documentId
        );

      if (!completed) {
        setTimeout(
          poll,
          2000
        );
      }
    };

    poll();
  };

  // =========================================
  // UPLOAD
  // =========================================

  const handleUpload = async () => {
    if (!file) {
      setMessage(
        "Please select a document first."
      );
      return;
    }

    setUploading(true);
    setMessage("");
    setProcessingStatus("");
    setVerificationResult(null);

    try {
      const formData = new FormData();

      // -------------------------------------
      // TEMPORARY DEMO BIDDER
      // -------------------------------------
      // We will replace this with the
      // logged-in bidder mapping next.
      formData.append(
        "bidder_id",
        "5"
      );

      formData.append(
        "document_type",
        documentType
      );

      formData.append(
        "file",
        file
      );

      // -------------------------------------
      // SEND FILE TO BACKEND
      // -------------------------------------

      const response = await fetch(
        `${API}/documents/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Document upload failed."
        );
      }

      const documentId =
        data?.document?.id;

      if (!documentId) {
        throw new Error(
          "Upload succeeded but document ID was not returned."
        );
      }

      // -------------------------------------
      // SUCCESS
      // -------------------------------------

      setMessage(
        "Document uploaded successfully."
      );

      setProcessingStatus(
        "PROCESSING"
      );

      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }

      // -------------------------------------
      // START STATUS POLLING
      // -------------------------------------

      startStatusPolling(
        documentId
      );

    } catch (error) {
      console.error(
        "Upload error:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Document upload failed."
      );

      setProcessingStatus(
        "FAILED"
      );

    } finally {
      setUploading(false);
    }
  };

  // =========================================
  // UI
  // =========================================

  return (
    <div className="space-y-6 pb-10">

      {/* HEADER */}

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
            setActivePage(
              "VerificationStatus"
            )
          }
          className="text-sm font-semibold text-blue-600"
        >
          Verification Status →
        </button>

      </header>


      {/* MAIN GRID */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_0.85fr]">

        {/* =====================================
            UPLOAD AREA
        ===================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-5">

            <h2 className="text-lg font-bold text-slate-950">
              Submit a document
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Upload PDF, JPG or PNG documents.
            </p>

          </div>


          {/* DOCUMENT TYPE */}

          <div className="mb-5">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Document Type
            </label>

            <select
              value={documentType}
              onChange={(e) =>
                setDocumentType(
                  e.target.value
                )
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


          {/* DROP ZONE */}

          <div
            onClick={() =>
              fileInputRef.current?.click()
            }

            onDragOver={(e) =>
              e.preventDefault()
            }

            onDrop={(e) => {
              e.preventDefault();

              handleFile(
                e.dataTransfer.files?.[0]
              );
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


          {/* FILE INPUT */}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) =>
              handleFile(
                e.target.files?.[0]
              )
            }
          />


          {/* SELECTED FILE */}

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
                onClick={() => {
                  setFile(null);

                  if (
                    fileInputRef.current
                  ) {
                    fileInputRef.current.value =
                      "";
                  }
                }}
                className="text-xs font-semibold text-rose-600"
              >
                Remove
              </button>

            </div>

          )}


          {/* MESSAGE */}

          {message && (

            <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
              {message}
            </p>

          )}


          {/* PROCESSING */}

          {processingStatus ===
            "PROCESSING" && (

            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">

              <div className="flex items-center gap-3">

                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />

                <div>

                  <p className="text-sm font-semibold text-blue-700">
                    Verification Processing...
                  </p>

                  <p className="mt-1 text-xs text-blue-500">
                    OCR, data extraction and compliance checks are running.
                  </p>

                </div>

              </div>

            </div>

          )}


          {/* VERIFICATION RESULT */}

          {verificationResult && (

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">

              <p className="text-sm font-bold text-slate-800">
                Verification Result
              </p>

              <div className="mt-3 grid grid-cols-2 gap-3">

                <div>

                  <p className="text-xs text-slate-400">
                    Status
                  </p>

                  <p className="text-sm font-semibold text-slate-700">
                    {verificationResult.verification_status ||
                      "—"}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-slate-400">
                    Score
                  </p>

                  <p className="text-sm font-semibold text-slate-700">
                    {verificationResult.score ??
                      "—"}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-slate-400">
                    Risk
                  </p>

                  <p className="text-sm font-semibold text-slate-700">
                    {verificationResult.risk_level ||
                      "—"}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-slate-400">
                    Issues
                  </p>

                  <p className="text-sm font-semibold text-slate-700">
                    {verificationResult.issues ||
                      "None"}
                  </p>

                </div>

              </div>

              {verificationResult.ai_recommendation && (

                <div className="mt-4 rounded-lg bg-white p-3">

                  <p className="text-xs font-semibold text-slate-400">
                    Recommendation
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {verificationResult.ai_recommendation}
                  </p>

                </div>

              )}

            </div>

          )}


          {/* UPLOAD BUTTON */}

          <button
            onClick={handleUpload}
            disabled={
              !file ||
              uploading ||
              processingStatus ===
                "PROCESSING"
            }
            className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >

            {uploading
              ? "Uploading..."
              : processingStatus ===
                "PROCESSING"
              ? "Verification Processing..."
              : "Upload Document"}

          </button>

        </section>


        {/* =====================================
            REQUIRED DOCUMENTS
        ===================================== */}

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