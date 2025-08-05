import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import RsvpForm from "./RsvpForm";
import agedToPerfectionImg from "./img/aged-to-perfection.jpg";
import { useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminPage from "./AdminPage";
import EmailPage from "./EmailPage";

const GOLD = "#c9b037";
const OFFWHITE = "#f8f6f2";
const MAPS_URL = "https://maps.app.goo.gl/Ws2JT6yEpx3bXp1Q8";

export default function App() {
  const { signIn } = useAuthActions();
  const loggedInUser = useQuery(api.auth.loggedInUser);

  useEffect(() => {
    if (loggedInUser === null) {
      // Not authenticated, sign in anonymously
      void signIn("anonymous");
    }
  }, [loggedInUser, signIn]);

  return (
    <BrowserRouter>
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: OFFWHITE }}
      >
        {/* Party Completion Banner */}
        <div
          className="fixed top-0 left-0 right-0 z-50"
          style={{
            background: GOLD,
            borderBottom: `2px solid ${GOLD}`,
            padding: "16px 20px",
            textAlign: "center",
            fontFamily: 'Georgia, Times, "Times New Roman", serif',
            boxShadow: "0 2px 8px rgba(201, 176, 55, 0.3)",
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#222",
              letterSpacing: 0.5,
              lineHeight: 1.4,
              maxWidth: "800px",
              margin: "0 auto",
            }}
          >
            The party is over! Thanks so much to all of you who came, and to those of you who couldn't, you were missed. Let's do this again in 10 years time! 🥳
          </div>
        </div>

        <div
          className="relative max-w-xl w-full mx-auto bg-white rounded-none"
          style={{
            border: `1.5px solid ${GOLD}`,
            boxShadow: "none",
            padding: 0,
            marginTop: "100px", // Add margin to account for the banner
          }}
        >
          {/* Inner gold border for double border effect */}
          <div
            className="absolute inset-4 pointer-events-none rounded-none"
            style={{ border: `1px solid ${GOLD}` }}
          />
          <div className="relative z-10 px-6 py-8 sm:px-12 sm:py-12 flex flex-col items-center">
            <Routes>
              <Route
                path="/"
                element={<InviteContent loggedInUser={loggedInUser} />}
              />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/email" element={<EmailPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
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
        <span style={{ fontWeight: 600 }}>FRIDAY, 18 JULY 2025, 7pm</span>
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
            width="32"
            height="32"
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

      {/* RSVP Status and Form */}
      <div className="mt-6 w-full max-w-md mx-auto">
        <RsvpForm userEmail={loggedInUser?.email ?? ""} currentRsvp={myRsvp} />
        {myRsvp === undefined && (
          <div className="text-center">Loading RSVP status...</div>
        )}
        {myRsvp && (
          <div
            className="text-center mb-4"
            style={{
              background: OFFWHITE,
              border: `1.5px solid ${GOLD}`,
              borderRadius: 0,
              padding: 20,
              fontFamily: "Georgia, serif",
            }}
          >
            <h3
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: GOLD,
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 8,
                fontFamily: "Georgia, serif",
              }}
            >
              Thanks for RSVPing, {myRsvp.name}!
            </h3>
            <p style={{ color: GOLD, fontSize: 15 }}>
              We've got your details. You can update your RSVP above if needed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
