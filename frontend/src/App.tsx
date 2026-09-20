import { useEffect, useState } from "react";

import Dashboard from "./pages/officer/Dashboard";
import Tenders from "./pages/officer/Tenders";
import Bidders from "./pages/officer/Bidders";
import Documents from "./pages/officer/Documents";
import Verification from "./pages/officer/Verification";
import Reports from "./pages/officer/Reports";
import ProfileSettings from "./pages/officer/ProfileSettings";

import BidderDashboard from "./pages/bidder/BidderDashboard";
import MyTenders from "./pages/bidder/MyTenders";
import MyBids from "./pages/bidder/MyBids";
import UploadDocuments from "./pages/bidder/UploadDocuments";
import VerificationStatus from "./pages/bidder/VerificationStatus";
import ProfileSettingsBidder from "./pages/bidder/ProfileSettingsBidder";

import Login from "./auth/Login";
import Register from "./auth/Register";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

type StoredUser = {
  name?: string;
  email?: string;
  organization?: string;
  phone?: string;
  password?: string;
  role?: "bidder" | "officer";
};

function App() {
  // =========================================
  // API
  // =========================================

  const API =
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000";

  // =========================================
  // CURRENT USER
  // =========================================

  const getStoredUser = (): StoredUser | null => {
    try {
      const storedUser =
        localStorage.getItem(
          "gem_verify_current_user"
        );

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);
    } catch (error) {
      console.error(
        "Stored user error:",
        error
      );

      return null;
    }
  };

  const storedUser = getStoredUser();

  // =========================================
  // STATE
  // =========================================

  const [activePage, setActivePage] =
    useState("Dashboard");

  const [role, setRole] =
    useState<"bidder" | "officer">(
      storedUser?.role || "bidder"
    );

  const [isAuthenticated, setIsAuthenticated] =
    useState(
      () =>
        localStorage.getItem(
          "gem_verify_current_user"
        ) !== null
    );

  const [showRegister, setShowRegister] =
    useState(false);

  const [tenders, setTenders] =
    useState<any[]>([]);

  const [bidders, setBidders] =
    useState<any[]>([]);

  const [documents, setDocuments] =
    useState<any[]>([]);

  const [selectedBidderId, setSelectedBidderId] =
    useState("4");

  const [verificationResults, setVerificationResults] =
    useState<any[]>([]);

  // =========================================
  // REFRESH BACKEND DATA
  // =========================================

  const refreshBackendData = async () => {
    try {
      const [
        tendersResponse,
        biddersResponse,
        documentsResponse,
        verificationResponse,
      ] = await Promise.all([
        fetch(`${API}/tenders`),
        fetch(`${API}/bidders`),
        fetch(`${API}/documents`),
        fetch(`${API}/verification-results`),
      ]);

      if (
        !tendersResponse.ok ||
        !biddersResponse.ok ||
        !documentsResponse.ok ||
        !verificationResponse.ok
      ) {
        throw new Error(
          "One or more backend requests failed."
        );
      }

      const [
        tendersData,
        biddersData,
        documentsData,
        verificationData,
      ] = await Promise.all([
        tendersResponse.json(),
        biddersResponse.json(),
        documentsResponse.json(),
        verificationResponse.json(),
      ]);

      setTenders(
        tendersData.tenders || []
      );

      setBidders(
        biddersData.bidders || []
      );

      setDocuments(
        documentsData.documents || []
      );

      setVerificationResults(
        verificationData.verification_results || []
      );

    } catch (error) {
      console.error(
        "Backend refresh error:",
        error
      );
    }
  };

  // =========================================
  // INITIAL BACKEND DATA
  // =========================================

  useEffect(() => {
    refreshBackendData();
  }, []);

  // =========================================
  // LOGIN
  // =========================================

  const handleLogin = (
    selectedRole: "bidder" | "officer"
  ) => {
    setRole(selectedRole);
    setActivePage("Dashboard");
    setIsAuthenticated(true);

    // Refresh latest backend data after login
    refreshBackendData();
  };

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = () => {
    localStorage.removeItem(
      "gem_verify_current_user"
    );

    localStorage.removeItem(
      "gem_verify_remember"
    );

    setIsAuthenticated(false);
    setRole("bidder");
    setActivePage("Dashboard");
    setShowRegister(false);
  };

  // =========================================
  // LOGIN / REGISTER SCREEN
  // =========================================

  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <Register
          onRegisterSuccess={() => {
            setShowRegister(false);
          }}
          onBackToLogin={() => {
            setShowRegister(false);
          }}
        />
      );
    }

    return (
      <Login
        onLogin={handleLogin}
        onRegister={() => {
          setShowRegister(true);
        }}
      />
    );
  }

  // =========================================
  // AUTHENTICATED APP
  // =========================================

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">

      {/* SIDEBAR */}

      <Sidebar
        role={role}
        activePage={activePage}
        setActivePage={setActivePage}
      />

      {/* MAIN AREA */}

      <div className="ml-64">

        {/* NAVBAR */}

        <Navbar
          role={role}
          setActivePage={setActivePage}
          onLogout={handleLogout}
        />

        {/* PAGE CONTENT */}

        <main className="p-8">

          {/* =====================================
              BIDDER ROUTES
          ===================================== */}

          {role === "bidder" &&
          activePage === "Dashboard" ? (

            <BidderDashboard
              setActivePage={setActivePage}
            />

          ) : role === "bidder" &&
            activePage === "MyTenders" ? (

            <MyTenders
              setActivePage={setActivePage}
            />

          ) : role === "bidder" &&
            activePage === "MyBids" ? (

            <MyBids
              setActivePage={setActivePage}
            />

          ) : role === "bidder" &&
            activePage === "UploadDocuments" ? (

            <UploadDocuments
              setActivePage={setActivePage}
            />

          ) : role === "bidder" &&
            activePage === "VerificationStatus" ? (

            <VerificationStatus
              setActivePage={setActivePage}
            />

          ) : role === "bidder" &&
            activePage === "Profile & Settings" ? (

            <ProfileSettingsBidder
              setActivePage={setActivePage}
            />

          /* =====================================
             OFFICER ROUTES
          ===================================== */

          ) : role === "officer" &&
            activePage === "Dashboard" ? (

            <Dashboard
              tenders={tenders}
              bidders={bidders}
              verificationResults={
                verificationResults
              }
              documents={documents}
              setActivePage={setActivePage}
            />

          ) : role === "officer" &&
            activePage === "Tenders" ? (

            <Tenders
              tenders={tenders}
            />

          ) : role === "officer" &&
            activePage === "Bidders" ? (

            <Bidders
              bidders={bidders}
              documents={documents}
              verificationResults={
                verificationResults
              }
              setActivePage={setActivePage}
              setSelectedBidderId={
                setSelectedBidderId
              }
            />

          ) : role === "officer" &&
            activePage === "Documents" ? (

            <Documents
              documents={documents}
              verificationResults={
                verificationResults
              }
            />

          ) : role === "officer" &&
            activePage === "Verification" ? (

            <Verification
              bidders={bidders}
              documents={documents}
              verificationResults={
                verificationResults
              }
              selectedBidderId={
                selectedBidderId
              }
              setSelectedBidderId={
                setSelectedBidderId
              }
            />

          ) : role === "officer" &&
            activePage === "Reports" ? (

            <Reports
              tenders={tenders}
              bidders={bidders}
              documents={documents}
              verificationResults={
                verificationResults
              }
            />

          ) : role === "officer" &&
            activePage ===
              "Profile & Settings" ? (

            <ProfileSettings />

          /* =====================================
             FALLBACK
          ===================================== */

          ) : role === "officer" ? (

            <Dashboard
              tenders={tenders}
              bidders={bidders}
              verificationResults={
                verificationResults
              }
              documents={documents}
              setActivePage={setActivePage}
            />

          ) : (

            <BidderDashboard
              setActivePage={setActivePage}
            />

          )}

        </main>
      </div>
    </div>
  );
}

export default App;