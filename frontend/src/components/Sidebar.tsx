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
    { name: "UploadDocuments", icon: "▤" },
    { name: "VerificationStatus", icon: "✓" },
  ];

  const menuItems = role === "bidder" ? bidderItems : officerItems;

  return (
    <aside className="fixed left-0 top-0 z-20 flex h-screen w-64 flex-col bg-slate-950 text-white">
      {/* Logo */}
      <div className="border-b border-slate-800 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold shadow-lg shadow-blue-600/20">
            G
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight">
              GeM Verify
            </h1>

            <p className="text-xs text-slate-400">
              Compliance Platform
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-6">
        {menuItems.map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => setActivePage(item.name)}
            className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              activePage === item.name
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-base ${
                activePage === item.name
                  ? "bg-blue-500"
                  : "bg-slate-900 group-hover:bg-slate-800"
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

            {activePage === item.name && (
              <span className="ml-auto h-2 w-2 rounded-full bg-white" />
            )}
          </button>
        ))}
      </nav>

      {/* System Status */}
      <div className="border-t border-slate-800 p-4">
        <div className="rounded-xl bg-slate-900 p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <div className="absolute inset-0 h-3 w-3 animate-ping rounded-full bg-green-500 opacity-30" />
            </div>

            <div>
              <p className="text-sm font-medium text-white">
                System Online
              </p>

              <p className="text-xs text-slate-500">
                All services operational
              </p>
            </div>
          </div>
        </div>

        <p className="mt-3 text-center text-[10px] text-slate-600">
          SIH26100 • GeM Compliance
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;