type SidebarProps = {
  role: "officer" | "bidder";
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
    { name: "Bid Review", icon: "▣" },
    { name: "Documents", icon: "▤" },
    { name: "Verification", icon: "✓" },
    { name: "Reports", icon: "▥" },
    { name: "Profile & Settings", icon: "⚙" },
  ];

  const bidderItems = [
    { name: "Dashboard", icon: "▦" },
    { name: "MyTenders", icon: "◫" },
    { name: "MyBids", icon: "♙" },
    { name: "UploadDocuments", icon: "▤" },
    { name: "VerificationStatus", icon: "✓" },
    { name: "Document Vault", icon: "▤" },
    { name: "Profile & Settings", icon: "⚙" },
  ];

  const menuItems =
    role === "officer" ? officerItems : bidderItems;

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-[#07142f] text-white">

      {/* Logo */}
      <div className="border-b border-white/10 px-6 py-6">
        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold shadow-lg shadow-blue-600/30">
            G
          </div>

          <div>
            <div className="text-base font-bold">
              GeM Verify
            </div>

            <div className="text-xs text-blue-200/70">
              Compliance Platform
            </div>
          </div>

        </div>
      </div>

      {/* Portal label */}
      <div className="px-5 pb-2 pt-7 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-200/50">
        {role === "officer" ? "Officer Portal" : "Bidder Portal"}
      </div>

      {/* Navigation */}
      <nav className="space-y-1 px-3 py-2">

        {menuItems.map((item) => {

          const active = activePage === item.name;

          return (
            <button
              key={item.name}
              type="button"
              onClick={() => setActivePage(item.name)}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-blue-100/70 hover:bg-white/5 hover:text-white"
              }`}
            >

              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm ${
                  active
                    ? "bg-blue-500"
                    : "bg-white/5"
                }`}
              >
                {item.icon}
              </span>

              <span>
                {item.name}
              </span>

              {active && (
                <span className="ml-auto h-2 w-2 rounded-full bg-white" />
              )}

            </button>
          );
        })}

      </nav>

      {/* System Status */}
      <div className="mt-auto border-t border-white/10 p-4">

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

          <div className="flex items-center gap-3">

            <div className="relative h-3 w-3 rounded-full bg-emerald-400">

              <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-30" />

            </div>

            <div>
              <p className="text-sm font-semibold">
                System Operational
              </p>

              <p className="text-[11px] text-blue-100/50">
                All services operational
              </p>
            </div>

          </div>

        </div>

        <p className="mt-3 text-center text-[10px] text-blue-100/30">
          SIH26100 • GeM Compliance
        </p>

      </div>

    </aside>
  );
};

export default Sidebar;