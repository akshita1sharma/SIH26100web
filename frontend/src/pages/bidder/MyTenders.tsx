import { useEffect, useState } from "react";

type MyTendersProps = {
  setActivePage: (page: string) => void;
};

const MyTenders = ({
  setActivePage,
}: MyTendersProps) => {
  const [tenders, setTenders] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/tenders")
      .then((res) => res.json())
      .then((data) =>
        setTenders(data.tenders || [])
      )
      .catch(() => setTenders([]));
  }, []);

  const filteredTenders = tenders.filter((tender) => {
    const text =
      `${tender.tender_number} ${tender.title} ${tender.description}`
        .toLowerCase();

    return text.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 pb-10">

      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Bidder Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-950">
            Available Tenders
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Explore and apply for new procurement opportunities.
          </p>
        </div>

        <button
          onClick={() => setActivePage("Dashboard")}
          className="text-sm font-semibold text-blue-600"
        >
          ← Dashboard
        </button>

      </header>


      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="flex flex-col gap-3 md:flex-row">

          <input
            type="text"
            placeholder="Search tenders by ID, title or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
          />

          <button className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600">
            Filters
          </button>

        </div>

      </section>


      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-6 py-5">

          <div className="flex items-center gap-2">

            <button className="border-b-2 border-blue-600 pb-2 text-sm font-semibold text-blue-600">
              All Tenders
            </button>

            <button className="px-3 pb-2 text-sm text-slate-400">
              Open
            </button>

            <button className="px-3 pb-2 text-sm text-slate-400">
              Closing Soon
            </button>

          </div>

        </div>


        {filteredTenders.length === 0 ? (

          <div className="px-6 py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-400">
              ▣
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-700">
              No tenders found
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Try another search term.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px]">

              <thead className="bg-slate-50">

                <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">

                  <th className="px-6 py-4">
                    Tender ID
                  </th>

                  <th className="px-6 py-4">
                    Title
                  </th>

                  <th className="px-6 py-4">
                    Description
                  </th>

                  <th className="px-6 py-4">
                    Deadline
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredTenders.map(
                  (tender, index) => (

                    <tr
                      key={tender.id ?? index}
                      className="transition hover:bg-slate-50"
                    >

                      <td className="px-6 py-5 text-sm font-bold text-slate-700">
                        {tender.tender_number}
                      </td>

                      <td className="px-6 py-5">

                        <p className="text-sm font-semibold text-slate-800">
                          {tender.title}
                        </p>

                      </td>

                      <td className="max-w-xs px-6 py-5 text-xs text-slate-500">
                        {tender.description || "—"}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-500">
                        {tender.submission_deadline || "—"}
                      </td>

                      <td className="px-6 py-5">

                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                          {tender.status || "OPEN"}
                        </span>

                      </td>

                      <td className="px-6 py-5">

                        <button className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50">
                          View
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  );
};

export default MyTenders;