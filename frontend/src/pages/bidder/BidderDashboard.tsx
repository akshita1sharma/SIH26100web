import { useEffect, useState } from "react";

const BiddersDashboard = ({
  setActivePage,
}: {
  setActivePage: (page: string) => void;
}) => {
  const [bidder, setBidder] = useState<any>(null);
  const [tenders, setTenders] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [verificationResults, setVerificationResults] = useState<any[]>([]);

  useEffect(() => {
    // Temporary bidder ID
    const bidderId = 5;

    fetch(`http://127.0.0.1:8000/bidders/${bidderId}`)
      .then((res) => res.json())
      .then((data) => setBidder(data.bidder || data))
      .catch((err) => console.error("Bidder fetch error:", err));

    fetch("http://127.0.0.1:8000/tenders")
      .then((res) => res.json())
      .then((data) => setTenders(data.tenders || []))
      .catch((err) => console.error("Tenders fetch error:", err));

    fetch(`http://127.0.0.1:8000/documents`)
      .then((res) => res.json())
      .then((data) => setDocuments(data.documents || []))
      .catch((err) => console.error("Documents fetch error:", err));

    fetch("http://127.0.0.1:8000/verification-results")
      .then((res) => res.json())
      .then((data) =>
        setVerificationResults(data.verification_results || [])
      )
      .catch((err) =>
        console.error("Verification fetch error:", err)
      );
  }, []);

  const bidderDocuments = documents.filter(
    (doc) => String(doc.bidder_id) === String(bidder?.id)
  );

  const bidderResults = verificationResults.filter((result) =>
    bidderDocuments.some(
      (doc) => String(doc.id) === String(result.document_id)
    )
  );

  const scores = bidderResults
    .map((result) => Number(result.score))
    .filter((score) => !Number.isNaN(score));

  const complianceScore =
    scores.length > 0
      ? Math.round(
          scores.reduce((sum, score) => sum + score, 0) /
            scores.length
        )
      : null;

  const verificationStatus =
    bidderResults.some(
      (result) => result.verification_status === "INVALID"
    )
      ? "NON-COMPLIANT"
      : bidderResults.some(
          (result) =>
            result.verification_status === "NEEDS_REVIEW"
        )
      ? "NEEDS REVIEW"
      : bidderResults.length > 0
      ? "COMPLIANT"
      : "PENDING";

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">
            BIDDER PORTAL
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Welcome{bidder?.company_name ? `, ${bidder.company_name}` : ""}
          </h1>

          <p className="mt-1 text-slate-500">
            Manage your tenders, bids and compliance documents.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActivePage("MyTenders")}
          className="..."
        >
          OPEN
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Available Tenders</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {tenders.length}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">My Documents</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {bidderDocuments.length}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Compliance Score
          </p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {complianceScore !== null
              ? `${complianceScore}/100`
              : "Pending"}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Verification Status
          </p>

          <p className="mt-2 text-lg font-bold text-slate-900">
            {verificationStatus}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">
          Quick Actions
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
          <button
            onClick={() => setActivePage("MyTenders")}
            className="rounded-xl border border-slate-200 p-5 text-left hover:border-blue-300 hover:bg-blue-50"
          >
            <p className="font-semibold text-slate-900">
              My Tenders
            </p>
            <p className="mt-1 text-sm text-slate-500">
              View available procurement opportunities.
            </p>
          </button>

          <button
            onClick={() => setActivePage("MyBids")}
            className="rounded-xl border border-slate-200 p-5 text-left hover:border-blue-300 hover:bg-blue-50"
          >
            <p className="font-semibold text-slate-900">
              My Bids
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Track your submitted bids.
            </p>
          </button>

          <button
            onClick={() => setActivePage("UploadDocuments")}
            className="rounded-xl border border-slate-200 p-5 text-left hover:border-blue-300 hover:bg-blue-50"
          >
            <p className="font-semibold text-slate-900">
              Upload Documents
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Submit documents for verification.
            </p>
          </button>

          <button
            onClick={() => setActivePage("VerificationStatus")}
            className="rounded-xl border border-slate-200 p-5 text-left hover:border-blue-300 hover:bg-blue-50"
          >
            <p className="font-semibold text-slate-900">
              Verification Status
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Check your document verification.
            </p>
          </button>
        </div>
      </div>

      {/* Recent Tenders */}
      <div className="mt-8 rounded-2xl bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-xl font-bold text-slate-900">
            Recent Tenders
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest procurement opportunities.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {tenders.slice(0, 5).map((tender) => (
            <div
              key={tender.id}
              className="flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-semibold text-slate-900">
                  {tender.tender_number}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {tender.title}
                </p>
              </div>

              <span className="w-fit rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                {tender.status}
              </span>
            </div>
          ))}

          {tenders.length === 0 && (
            <p className="p-8 text-center text-sm text-slate-500">
              No tenders available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BiddersDashboard;