import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

const GOLD = "#c9b037";
const OFFWHITE = "#f8f6f2";

export default function AdminPage() {
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
