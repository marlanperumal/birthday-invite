import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import RsvpForm from "./RsvpForm";
import agedToPerfectionImg from "./img/aged-to-perfection.jpg";
import { useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

const GOLD = "#c9b037";
const OFFWHITE = "#f8f6f2";

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
          <InviteContent loggedInUser={loggedInUser} />
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
        className="mb-1"
        style={{ fontSize: 17, letterSpacing: 1, color: "#222" }}
      >
        THE TERRACE ROOFTOP VENUE
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
