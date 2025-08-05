import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import { useAuthActions } from "@convex-dev/auth/react";
import { useNavigate } from "react-router-dom";

const GOLD = "#c9b037";
const OFFWHITE = "#f8f6f2";

export default function EmailPage() {
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [testEmail, setTestEmail] = useState("");
    const [isSending, setIsSending] = useState(false);
    const sendEmail = useMutation(api.emails.sendEmail);
    const { signOut } = useAuthActions();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate("/");
    };

    const handleSend = async (isTest: boolean) => {
        if (!subject || !body) {
            toast.error("Please fill in both subject and body fields");
            return;
        }

        if (isTest && !testEmail) {
            toast.error("Please provide a test email address");
            return;
        }

        setIsSending(true);
        try {
            const result = await sendEmail({
                subject,
                body,
                testEmail: isTest ? testEmail : undefined,
            });

            toast.success(
                <span style={{ color: GOLD, fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 18 }}>
                    {`Email sent successfully to ${result.recipients} recipient${result.recipients !== 1 ? 's' : ''}!`}
                </span>,
                {
                    style: {
                        background: OFFWHITE,
                        border: `1.5px solid ${GOLD}`,
                        color: GOLD,
                        fontFamily: "Georgia, serif",
                        fontSize: 16,
                    },
                }
            );
        } catch (error) {
            toast.error(
                <span style={{ color: "#b91c1c", fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 18 }}>
                    Failed to send email. Please try again.
                </span>,
                {
                    style: {
                        background: OFFWHITE,
                        border: `1.5px solid #b91c1c`,
                        color: "#b91c1c",
                        fontFamily: "Georgia, serif",
                        fontSize: 16,
                    },
                }
            );
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div style={{ width: "100%", maxWidth: 700, margin: "0 auto", padding: 20, fontFamily: "Georgia, serif" }}>
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
                    Send Email to Guests
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

            <div style={{ background: OFFWHITE, border: `1px solid ${GOLD}`, padding: 32, marginBottom: 32 }}>
                <div style={{ marginBottom: 20 }}>
                    <label
                        htmlFor="subject"
                        style={{
                            display: "block",
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#444",
                            textTransform: "uppercase",
                            letterSpacing: 1,
                            marginBottom: 8,
                        }}
                    >
                        Subject
                    </label>
                    <input
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        disabled={true}
                        style={{
                            width: "100%",
                            padding: 12,
                            border: `1px solid ${GOLD}`,
                            fontFamily: "Georgia, serif",
                            fontSize: 15,
                            background: "#f5f5f5",
                            color: "#888",
                            cursor: "not-allowed",
                        }}
                    />
                </div>

                <div style={{ marginBottom: 20 }}>
                    <label
                        htmlFor="body"
                        style={{
                            display: "block",
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#444",
                            textTransform: "uppercase",
                            letterSpacing: 1,
                            marginBottom: 8,
                        }}
                    >
                        Body (HTML supported)
                    </label>
                    <textarea
                        id="body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={10}
                        disabled={true}
                        style={{
                            width: "100%",
                            padding: 12,
                            border: `1px solid ${GOLD}`,
                            fontFamily: "Georgia, serif",
                            fontSize: 15,
                            background: "#f5f5f5",
                            color: "#888",
                            resize: "vertical",
                            cursor: "not-allowed",
                        }}
                    />
                </div>

                <div style={{ marginBottom: 20 }}>
                    <label
                        htmlFor="testEmail"
                        style={{
                            display: "block",
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#444",
                            textTransform: "uppercase",
                            letterSpacing: 1,
                            marginBottom: 8,
                        }}
                    >
                        Test Email Address
                    </label>
                    <input
                        id="testEmail"
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        disabled={true}
                        style={{
                            width: "100%",
                            padding: 12,
                            border: `1px solid ${GOLD}`,
                            fontFamily: "Georgia, serif",
                            fontSize: 15,
                            background: "#f5f5f5",
                            color: "#888",
                            marginBottom: 12,
                            cursor: "not-allowed",
                        }}
                    />
                    <button
                        onClick={() => handleSend(true)}
                        disabled={true}
                        style={{
                            width: "100%",
                            padding: "12px 0",
                            border: `1.5px solid ${GOLD}`,
                            background: "#f5f5f5",
                            color: "#888",
                            fontFamily: "Georgia, serif",
                            fontSize: 16,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: 1,
                            cursor: "not-allowed",
                            opacity: 0.7,
                            marginBottom: 20,
                        }}
                    >
                        Email Form Disabled
                    </button>
                </div>

                <button
                    onClick={() => handleSend(false)}
                    disabled={true}
                    style={{
                        width: "100%",
                        padding: "12px 0",
                        border: `1.5px solid ${GOLD}`,
                        background: "#f5f5f5",
                        color: "#888",
                        fontFamily: "Georgia, serif",
                        fontSize: 18,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 2,
                        cursor: "not-allowed",
                        opacity: 0.7,
                    }}
                >
                    Email Form Disabled
                </button>
            </div>
        </div>
    );
} 