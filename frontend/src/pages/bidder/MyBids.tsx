type MyBidsProps = {
  setActivePage: (page: string) => void;
};

const MyBids = ({
  setActivePage,
}: MyBidsProps) => {
  return (
    <div className="space-y-6 pb-10">

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>

          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Bidder Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-950">
            My Bids
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track and manage your submitted bids.
          </p>

        </div>

        <button
          onClick={() => setActivePage("MyTenders")}
          className="text-sm font-semibold text-blue-600"
        >
          Browse Tenders →
        </button>

      </header>


      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-6 py-4">

          <div className="flex gap-6 text-sm">

            <button className="border-b-2 border-blue-600 pb-3 font-semibold text-blue-600">
              All Bids
            </button>

            <button className="pb-3 text-slate-400">
              Under Review
            </button>

            <button className="pb-3 text-slate-400">
              Accepted
            </button>

            <button className="pb-3 text-slate-400">
              Rejected
            </button>

          </div>

        </div>


        <div className="px-6 py-16 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
            ♙
          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-900">
            No bids submitted yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Your submitted bids will appear here with their current status,
            evaluation stage and tender information.
          </p>

          <button
            onClick={() => setActivePage("MyTenders")}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Browse Available Tenders
          </button>

        </div>

      </section>

    </div>
  );
};

export default MyBids;