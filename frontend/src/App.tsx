import { useEffect, useState } from "react";

import Dashboard from "./pages/officer/Dashboard";
import Tenders from "./pages/officer/Tenders";
import Bidders from "./pages/officer/Bidders";
import Documents from "./pages/officer/Documents";
import Verification from "./pages/officer/Verification";

import BidderDashboard from "./pages/bidder/BidderDashboard";
import MyTenders from "./pages/bidder/MyTenders";
import MyBids from "./pages/bidder/MyBids";
import UploadDocuments from "./pages/bidder/UploadDocuments";
import VerificationStatus from "./pages/bidder/VerificationStatus";

import Login from "./auth/Login";
import Register from "./auth/Register";

import Sidebar from "./components/Sidebar";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  const [role, setRole] = useState<"bidder" | "officer">("bidder");

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [showRegister, setShowRegister] = useState(false);

  const [tenders, setTenders] = useState<any[]>([]);
  const [bidders, setBidders] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedBidderId, setSelectedBidderId] = useState("4");
  const [verificationResults, setVerificationResults] =
    useState<any[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/tenders")
      .then((res) => res.json())
      .then((data) => {
        setTenders(data.tenders || []);
      })
      .catch((error) => {
        console.error("Tenders fetch error:", error);
      });

    fetch("http://127.0.0.1:8000/bidders")
      .then((res) => res.json())
      .then((data) => {
        setBidders(data.bidders || []);
      })
      .catch((error) => {
        console.error("Bidders fetch error:", error);
      });

    fetch("http://127.0.0.1:8000/documents")
      .then((res) => res.json())
      .then((data) => {
        setDocuments(data.documents || []);
      })
      .catch((error) => {
        console.error("Documents fetch error:", error);
      });

    fetch("http://127.0.0.1:8000/verification-results")
      .then((res) => res.json())
      .then((data) => {
        setVerificationResults(
          data.verification_results || []
        );
      })
      .catch((error) => {
        console.error(
          "Verification results fetch error:",
          error
        );
      });
  }, []);

  // -----------------------------
  // LOGIN / REGISTER
  // -----------------------------

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
        onLogin={(selectedRole) => {
          setRole(selectedRole);
          setActivePage("Dashboard");
          setIsAuthenticated(true);
        }}
        onRegister={() => {
          setShowRegister(true);
        }}
      />
    );
  }

  // -----------------------------
  // AUTHENTICATED APP
  // -----------------------------

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">

      <Sidebar
        role={role}
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="ml-64 min-h-screen p-7 lg:p-8">

        {/* ===================== */}
        {/* BIDDER */}
        {/* ===================== */}

        {role === "bidder" &&
          activePage === "Dashboard" && (
            <BidderDashboard
              setActivePage={setActivePage}
            />
          )}

        {role === "bidder" &&
          activePage === "MyTenders" && (
            <MyTenders
              setActivePage={setActivePage}
            />
          )}

        {role === "bidder" &&
          activePage === "MyBids" && (
            <MyBids
              setActivePage={setActivePage}
            />
          )}

        {role === "bidder" &&
          activePage === "UploadDocuments" && (
            <UploadDocuments
              setActivePage={setActivePage}
            />
          )}

        {role === "bidder" &&
          activePage === "VerificationStatus" && (
            <VerificationStatus
              setActivePage={setActivePage}
            />
          )}

        {/* ===================== */}
        {/* OFFICER */}
        {/* ===================== */}

        {role === "officer" &&
          activePage === "Dashboard" && (
            <Dashboard
              tenders={tenders}
              bidders={bidders}
              verificationResults={verificationResults}
              setActivePage={setActivePage}
            />
          )}

        {role === "officer" &&
          activePage === "Tenders" && (
            <Tenders
              tenders={tenders}
              setActivePage={setActivePage}
            />
          )}

        {role === "officer" &&
          activePage === "Bidders" && (
            <Bidders
              bidders={bidders}
              documents={documents}
              verificationResults={verificationResults}
              setActivePage={setActivePage}
              setSelectedBidderId={setSelectedBidderId}
            />
          )}

        {role === "officer" &&
          activePage === "Documents" && (
            <Documents
              documents={documents}
              verificationResults={verificationResults}
            />
          )}

        {role === "officer" &&
          activePage === "Verification" && (
            <Verification
              bidders={bidders}
              documents={documents}
              verificationResults={verificationResults}
              selectedBidderId={selectedBidderId}
              setSelectedBidderId={setSelectedBidderId}
            />
          )}

      </main>
    </div>
  );
}

export default App;