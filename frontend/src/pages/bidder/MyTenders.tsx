const MyTenders = ({
  setActivePage,
}: {
  setActivePage: (page: string) => void;
}) => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm font-semibold text-blue-600">
            BIDDER PORTAL
          </p>

          <h1 className="text-3xl font-bold text-gray-900">
            My Tenders
          </h1>

          <p className="text-gray-500 mt-1">
            View tenders available for bidding.
          </p>
        </div>

        <button
          onClick={() => setActivePage("Dashboard")}
          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">
          Available Tenders
        </h2>

        <div className="border rounded-lg p-5">
          <h3 className="font-semibold text-lg">
            CPCL-TEST-002
          </h3>

          <p className="text-gray-500 mt-1">
            Procurement opportunity available for bidding.
          </p>

          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            View Tender
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyTenders;