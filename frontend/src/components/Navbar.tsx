import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
  HelpCircle,
} from "lucide-react";

type NavbarProps = {
  role: "bidder" | "officer";
  setActivePage: (page: string) => void;
  onLogout: () => void;
};

type StoredUser = {
  name?: string;
  email?: string;
  organization?: string;
  phone?: string;
  role?: "bidder" | "officer";
};

const Navbar = ({
  role,
  setActivePage,
  onLogout,
}: NavbarProps) => {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // =========================================
  // LOAD CURRENT USER
  // =========================================

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(
        "gem_verify_current_user"
      );

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("User load error:", error);
    }
  }, []);

  // =========================================
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // =========================================

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // =========================================
  // USER DETAILS
  // =========================================

  const userName =
    user?.name ||
    (role === "officer"
      ? "Amit Sharma"
      : "Bidder");

  const organization =
    user?.organization ||
    (role === "officer"
      ? "Procurement Officer"
      : "Registered Bidder");

  const initials =
    userName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) =>
        word.charAt(0).toUpperCase()
      )
      .join("") || "U";

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = () => {
    setShowMenu(false);

    localStorage.removeItem(
      "gem_verify_current_user"
    );

    localStorage.removeItem(
      "gem_verify_remember"
    );

    onLogout();
  };

  // =========================================
  // PROFILE
  // =========================================

  const handleProfile = () => {
    setShowMenu(false);
    setActivePage("Profile & Settings");
  };

  return (
    <header className="sticky top-0 z-40 h-[70px] border-b border-slate-200 bg-white">

      <div className="flex h-full items-center justify-between px-6">

        {/* ===================================== */}
        {/* LEFT */}
        {/* ===================================== */}

        <div className="flex items-center gap-5">

          {/* MENU */}

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <Menu size={20} />
          </button>

          {/* SEARCH */}

          <div className="relative hidden w-[360px] md:block">

            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder={
                role === "officer"
                  ? "Search tenders, bidders, documents..."
                  : "Search tenders, documents..."
              }
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />

          </div>

        </div>

        {/* ===================================== */}
        {/* RIGHT */}
        {/* ===================================== */}

        <div className="flex items-center gap-5">

          {/* NOTIFICATION */}

          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
          >
            <Bell size={19} />

            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              3
            </span>
          </button>

          {/* DIVIDER */}

          <div className="hidden h-8 w-px bg-slate-200 sm:block" />

          {/* PROFILE */}

          <div
            ref={menuRef}
            className="relative"
          >

            <button
              type="button"
              onClick={() =>
                setShowMenu(!showMenu)
              }
              className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-50"
            >

              {/* AVATAR */}

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm">
                {initials}
              </div>

              {/* USER INFO */}

              <div className="hidden text-left sm:block">

                <p className="max-w-[150px] truncate text-sm font-bold text-slate-800">
                  {userName}
                </p>

                <p className="max-w-[150px] truncate text-[11px] text-slate-400">
                  {role === "officer"
                    ? "Procurement Officer"
                    : organization}
                </p>

              </div>

              <ChevronDown
                size={16}
                className={`text-slate-400 transition ${
                  showMenu
                    ? "rotate-180"
                    : ""
                }`}
              />

            </button>

            {/* ================================= */}
            {/* DROPDOWN */}
            {/* ================================= */}

            {showMenu && (
              <div className="absolute right-0 top-[54px] w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/40">

                {/* USER HEADER */}

                <div className="bg-slate-50 p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                      {initials}
                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-bold text-slate-900">
                        {userName}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {user?.email || "Account"}
                      </p>

                    </div>

                  </div>

                  {organization && (
                    <p className="mt-3 truncate text-[11px] text-slate-500">
                      {organization}
                    </p>
                  )}

                </div>

                {/* MENU */}

                <div className="p-2">

                  <button
                    type="button"
                    onClick={handleProfile}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    <User
                      size={17}
                      className="text-slate-500"
                    />

                    <span>
                      Profile & Settings
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      alert(
                        "Account settings will be connected here."
                      );
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    <Settings
                      size={17}
                      className="text-slate-500"
                    />

                    <span>
                      Account Settings
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      alert(
                        "Help & Support will be connected here."
                      );
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    <HelpCircle
                      size={17}
                      className="text-slate-500"
                    />

                    <span>
                      Help & Support
                    </span>
                  </button>

                </div>

                {/* LOGOUT */}

                <div className="border-t border-slate-100 p-2">

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl bg-red-50 px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-100"
                  >

                    <LogOut size={17} />

                    <span>
                      Logout
                    </span>

                  </button>

                </div>

              </div>
            )}

          </div>

        </div>

      </div>

    </header>
  );
};

export default Navbar;