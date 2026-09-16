type SidebarProps = {
  role: string;
  activePage: string;
  setActivePage: (page: string) => void;
};

const Sidebar = ({
  role,
  activePage,
  setActivePage,
}: SidebarProps) => {
  const officerItems = [
    { name: "Dashboard", icon: "▦" },
    { name: "Tenders", icon: "◫" },
    { name: "Bidders", icon: "♙" },
    { name: "Documents", icon: "▤" },
    { name: "Verification", icon: "✓" },
  ];

  const bidderItems = [
    { name: "Dashboard", icon: "▦" },
    { name: "MyTenders", icon: "◫" },
    { name: "MyBids", icon: "♙" },
    { name: "UploadDocuments", icon: "↥" },
    { name: "VerificationStatus", icon: "✓" },
  ];

  const menuItems = role === "bidder" ? bidderItems : officerItems;

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col bg-[#071126] text-white">

      {/* Brand */}
      <div className="border-b border-white/10 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold shadow-lg shadow-blue-600/30">
            G
          </div>

          <div>
            <h1 className="text-[17px] font-bold tracking-tight">
              GeM Verify
            </h1>

            <p className="text-xs text-slate-400">
              Compliance Platform
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-7">

        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Workspace
        </p>

        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const active = activePage === item.name;

            return (
              <button
                key={item.name}
                onClick={() => setActivePage(item.name)}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm ${
                    active
                      ? "bg-white/15 text-white"
                      : "bg-white/5 text-slate-400 group-hover:text-white"
                  }`}
                >
                  {item.icon}
                </span>

                <span>
                  {item.name === "MyTenders"
                    ? "My Tenders"
                    : item.name === "MyBids"
                    ? "My Bids"
                    : item.name === "UploadDocuments"
                    ? "Upload Documents"
                    : item.name === "VerificationStatus"
                    ? "Verification Status"
                    : item.name}
                </span>

                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System status */}
      <div className="px-4 pb-5">

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">

          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </span>

            <div>
              <p className="text-sm font-semibold">
                System Online
              </p>

              <p className="text-[11px] text-slate-500">
                All services operational
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-white/10 pt-3">
            <p className="text-[10px] text-slate-600">
              SIH26100 • GeM Compliance
            </p>
          </div>
        </div>

      </div>

    </aside>
  );
};

export default Sidebar;