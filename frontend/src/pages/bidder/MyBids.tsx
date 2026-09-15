const MyBids = ({
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
            My Bids
          </h1>

          <p className="mt-1 text-gray-500">
            Track your submitted bids and their status.
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

      {/* Bid List */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Submitted Bids
        </h2>

        {/* Empty State */}
        <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center">
          <div className="mb-3 text-4xl">📋</div>

          <h3 className="text-lg font-semibold text-gray-800">
            No bids submitted yet
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Your submitted bids will appear here.
          </p>

          <button
            type="button"
            onClick={() => setActivePage("MyTenders")}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Browse Tenders
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyBids;