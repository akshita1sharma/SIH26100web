const VerificationStatus = ({
  setActivePage,
}: {
  setActivePage: (page: string) => void;
}) => {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">
            BIDDER PORTAL
          </p>

          <h1 className="text-3xl font-bold text-gray-900">
            Verification Status
          </h1>

          <p className="mt-1 text-gray-500">
            Check the verification status of your submitted documents.
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

      {/* Overall Status */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Overall Verification
            </p>

            <h2 className="mt-1 text-2xl font-bold text-yellow-600">
              PENDING
            </h2>
          </div>

          <div className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-700">
            Under Review
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold">
            Document Verification
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Status of your submitted compliance documents.
          </p>
        </div>

        <div className="divide-y">
          {/* Document 1 */}
          <div className="flex items-center justify-between p-5">
            <div>
              <h3 className="font-medium text-gray-800">
                GST Certificate
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Submitted for verification
              </p>
            </div>

            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
              PENDING
            </span>
          </div>

          {/* Document 2 */}
          <div className="flex items-center justify-between p-5">
            <div>
              <h3 className="font-medium text-gray-800">
                Company Registration
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Submitted for verification
              </p>
            </div>

            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
              PENDING
            </span>
          </div>

          {/* Document 3 */}
          <div className="flex items-center justify-between p-5">
            <div>
              <h3 className="font-medium text-gray-800">
                PAN Certificate
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Not yet verified
              </p>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              PENDING
            </span>
          </div>
        </div>
      </div>

      {/* Upload Button */}
      <div className="mt-6">
        <button
          type="button"
          onClick={() => setActivePage("UploadDocuments")}
          className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          Upload More Documents
        </button>
      </div>
    </div>
  );
};

export default VerificationStatus;