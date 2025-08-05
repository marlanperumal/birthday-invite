import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useNavigate } from "react-router-dom";

const GOLD = "#c9b037";
const OFFWHITE = "#f8f6f2";

export default function AdminPage() {
  const allRsvps = useQuery(api.rsvps.listAll);
  const { signOut } = useAuthActions();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div style={{ width: "100%", maxWidth: 700, fontFamily: "Georgia, serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "#222",
            textTransform: "uppercase",
            letterSpacing: 2,
            margin: 0,
          }}
        >
          RSVP Responses
        </h2>
        <button
          onClick={handleSignOut}
          style={{
            padding: "8px 16px",
            border: `1px solid ${GOLD}`,
            background: "white",
            color: GOLD,
            fontFamily: "Georgia, serif",
            fontSize: 14,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 1,
            cursor: "pointer",
          }}
        >
          Sign Out
        </button>
      </div>
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
                <th style={thStyle}>Dietary</th>
                <th style={thStyle}>Email</th>
              </tr>
            </thead>
            <tbody>
              {allRsvps.map((rsvp: any) => (
                <>
                  <tr
                    key={rsvp._id}
                    style={{ borderBottom: `1px solid ${GOLD}` }}
                  >
                    <td style={tdStyle}>{rsvp.name}</td>
                    <td style={tdStyle}>
                      {(rsvp.dietaryPreferences || []).join(", ")}
                      {rsvp.otherDietaryPreference
                        ? `, ${rsvp.otherDietaryPreference}`
                        : ""}
                    </td>
                    <td style={tdStyle}>{rsvp.email}</td>
                  </tr>
                  {rsvp.hasPlusOne && (
                    <tr
                      key={`${rsvp._id}-plus-one`}
                      style={{
                        borderBottom: `1px solid ${GOLD}`,
                        background: OFFWHITE,
                        opacity: 0.8,
                      }}
                    >
                      <td style={tdStyle}>
                        <span style={{ color: GOLD, fontWeight: 600 }}>
                          +1:{" "}
                        </span>
                        {rsvp.plusOneName}
                      </td>
                      <td style={tdStyle}>
                        {(rsvp.plusOneDietaryPreferences || []).join(", ")}
                        {rsvp.plusOneOtherDietaryPreference
                          ? `, ${rsvp.plusOneOtherDietaryPreference}`
                          : ""}
                      </td>
                      <td style={tdStyle}>{rsvp.plusOneEmail}</td>
                    </tr>
                  )}
                </>
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
