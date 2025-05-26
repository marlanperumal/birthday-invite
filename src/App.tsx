import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import RsvpForm from "./RsvpForm";
import agedToPerfectionImg from "./img/aged-to-perfection.jpg";
import { useEffect, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

const GOLD = "#c9b037";
const OFFWHITE = "#f8f6f2";
const ADMIN_PASSWORD = "letmein"; // Change this to something secure in production
const MAPS_URL = "https://maps.app.goo.gl/Ws2JT6yEpx3bXp1Q8";

export default function App() {
  const { signIn } = useAuthActions();
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminAuthed, setAdminAuthed] = useState(false);

  useEffect(() => {
    if (loggedInUser === null) {
      // Not authenticated, sign in anonymously
      void signIn("anonymous");
    }
  }, [loggedInUser, signIn]);

  function handleAdminClick() {
    if (adminAuthed) {
      setShowAdmin((v) => !v);
      return;
    }
    const pw = window.prompt("Enter admin password:");
    if (pw === ADMIN_PASSWORD) {
      setAdminAuthed(true);
      setShowAdmin(true);
    } else if (pw !== null) {
      window.alert("Incorrect password");
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: OFFWHITE }}
    >
      <div
        className="relative max-w-xl w-full mx-auto bg-white rounded-none"
        style={{ border: `1.5px solid ${GOLD}`, boxShadow: "none", padding: 0 }}
      >
        {/* Inner gold border for double border effect */}
        <div
          className="absolute inset-4 pointer-events-none rounded-none"
          style={{ border: `1px solid ${GOLD}` }}
        />
        <div className="relative z-10 px-6 py-8 sm:px-12 sm:py-12 flex flex-col items-center">
          {showAdmin ? (
            <AdminPage />
          ) : (
            <InviteContent loggedInUser={loggedInUser} />
          )}
          <button
            onClick={handleAdminClick}
            style={{
              marginTop: 32,
              fontFamily: "Georgia, serif",
              fontSize: 15,
              color: GOLD,
              border: `1px solid ${GOLD}`,
              background: "#fff",
              padding: "8px 24px",
              textTransform: "uppercase",
              letterSpacing: 1,
              cursor: "pointer",
            }}
          >
            {showAdmin ? "Back to Invite" : "Admin: View RSVPs"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InviteContent({ loggedInUser }: { loggedInUser: any }) {
  const myRsvp = useQuery(api.rsvps.getMyRsvp);

  return (
    <div
      className="flex flex-col items-center text-center font-serif"
      style={{ fontFamily: 'Georgia, Times, "Times New Roman", serif' }}
    >
      {/* Glass Illustration replaced with image */}
      <img
        src={agedToPerfectionImg}
        alt="Aged to Perfection Glass"
        className="mb-2"
        style={{
          width: 320,
          objectFit: "contain",
          display: "block",
          margin: "0 auto",
        }}
      />

      {/* Main Heading */}
      <div
        className="mb-2 mt-2"
        style={{
          fontSize: 18,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "#444",
          fontWeight: 500,
        }}
      >
        LET'S RAISE A GLASS TO
      </div>
      <div
        className="mb-1"
        style={{
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "#222",
          fontFamily: "Georgia, serif",
        }}
      >
        MARLAN PERUMAL
      </div>
      <div className="italic mb-6" style={{ fontSize: 20, color: "#444" }}>
        on his 40th birthday
      </div>

      {/* Details */}
      <div
        className="mb-1"
        style={{ fontSize: 17, letterSpacing: 1, color: "#222" }}
      >
        <span style={{ fontWeight: 600 }}>FRIDAY, 18 JULY 2025</span>
      </div>
      <div
        className="mb-1 flex items-center justify-center gap-2"
        style={{ fontSize: 17, letterSpacing: 1, color: "#222" }}
      >
        <a
          href={MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            marginRight: 6,
          }}
          aria-label="View venue on map"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginRight: 4, verticalAlign: "middle" }}
          >
            <path
              d="M10 2C6.686 2 4 4.686 4 8c0 4.418 5.25 9.25 5.477 9.463a1 1 0 0 0 1.046 0C10.75 17.25 16 12.418 16 8c0-3.314-2.686-6-6-6zm0 14.243C8.14 14.01 6 10.97 6 8a4 4 0 1 1 8 0c0 2.97-2.14 6.01-4 8.243z"
              fill={GOLD}
            />
            <circle cx="10" cy="8" r="2" fill={GOLD} />
          </svg>
        </a>
        <span style={{ verticalAlign: "middle" }}>
          THE TERRACE ROOFTOP VENUE
        </span>
      </div>
      <div
        className="mb-1"
        style={{ fontSize: 17, letterSpacing: 1, color: "#222" }}
      >
        DRESS CODE: <span style={{ textTransform: "uppercase" }}>COCKTAIL</span>
      </div>
      <div className="italic mb-4" style={{ fontSize: 15, color: "#444" }}>
        Cocktails and canapés will be served. Please provide any specific
        dietary requirements.
      </div>

      {/* RSVP */}
      <div
        className="mb-1"
        style={{ fontSize: 16, fontWeight: 600, color: "#222" }}
      >
        RSVP BY 9 JUNE 2025
      </div>

      {/* RSVP Status and Form */}
      <div className="mt-6 w-full max-w-md mx-auto">
        {myRsvp === undefined && (
          <div className="text-center">Loading RSVP status...</div>
        )}
        {myRsvp && (
          <div className="text-center p-4 bg-green-100 border border-green-300 rounded-lg mb-4">
            <h3 className="text-xl font-semibold text-green-700">
              Thanks for RSVPing, {myRsvp.name}!
            </h3>
            <p className="text-green-600">
              We've got your details. You can update your RSVP below if needed.
            </p>
          </div>
        )}
        <RsvpForm userEmail={loggedInUser?.email ?? ""} currentRsvp={myRsvp} />
      </div>
    </div>
  );
}

function AdminPage() {
  const allRsvps = useQuery(api.rsvps.listAll);

  return (
    <div style={{ width: "100%", maxWidth: 700, fontFamily: "Georgia, serif" }}>
      <h2
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: "#222",
          textTransform: "uppercase",
          letterSpacing: 2,
          marginBottom: 24,
          textAlign: "center",
        }}
      >
        RSVP Responses
      </h2>
      {!allRsvps ? (
        <div
          style={{ textAlign: "center", color: "#888", fontStyle: "italic" }}
        >
          Loading...
        </div>
      ) : allRsvps.length === 0 ? (
        <div
          style={{ textAlign: "center", color: "#888", fontStyle: "italic" }}
        >
          No RSVPs yet.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}
          >
            <thead>
              <tr style={{ background: OFFWHITE }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Dietary</th>
                <th style={thStyle}>Plus One Name</th>
                <th style={thStyle}>Plus One Email</th>
                <th style={thStyle}>Plus One Dietary</th>
              </tr>
            </thead>
            <tbody>
              {allRsvps.map((rsvp: any) => (
                <tr
                  key={rsvp._id}
                  style={{ borderBottom: `1px solid ${GOLD}` }}
                >
                  <td style={tdStyle}>{rsvp.name}</td>
                  <td style={tdStyle}>{rsvp.email}</td>
                  <td style={tdStyle}>
                    {(rsvp.dietaryPreferences || []).join(", ")}
                    {rsvp.otherDietaryPreference
                      ? `, ${rsvp.otherDietaryPreference}`
                      : ""}
                  </td>
                  <td style={tdStyle}>{rsvp.plusOneName || ""}</td>
                  <td style={tdStyle}>{rsvp.plusOneEmail || ""}</td>
                  <td style={tdStyle}>
                    {(rsvp.plusOneDietaryPreferences || []).join(", ")}
                    {rsvp.plusOneOtherDietaryPreference
                      ? `, ${rsvp.plusOneOtherDietaryPreference}`
                      : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle = {
  borderBottom: `2px solid ${GOLD}`,
  padding: "8px 12px",
  textAlign: "left" as const,
  fontWeight: 700,
  color: "#222",
  textTransform: "uppercase" as const,
  letterSpacing: 1,
  fontSize: 14,
  background: OFFWHITE,
};

const tdStyle = {
  padding: "8px 12px",
  fontSize: 15,
  color: "#222",
  fontFamily: "Georgia, serif",
};
