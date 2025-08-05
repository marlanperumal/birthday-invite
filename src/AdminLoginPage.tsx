import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const GOLD = "#c9b037";
const OFFWHITE = "#f8f6f2";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [adminPassword, setAdminPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { signIn } = useAuthActions();
    const navigate = useNavigate();
    const createAdminProfile = useMutation(api.auth.createAdminProfile);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Create FormData for authentication
            const formData = new FormData();
            formData.set("email", email);
            formData.set("password", password);
            formData.set("flow", "signIn");

            // Try to sign in first
            try {
                await signIn("password", formData);
            } catch (signInError) {
                // If sign in fails, try to sign up
                formData.set("flow", "signUp");
                await signIn("password", formData);
            }

            // Then create admin profile
            const result = await createAdminProfile({
                adminPassword,
            });

            if (result) {
                toast.success("Admin access granted!");
                navigate("/admin");
            } else {
                toast.error("Invalid admin password");
            }
        } catch (error) {
            console.error("Authentication error:", error);
            if (error instanceof Error && error.message.includes("Invalid password")) {
                toast.error("Password must be at least 8 characters long and contain letters and numbers");
            } else {
                toast.error("Authentication failed. Please check your credentials.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ width: "100%", maxWidth: 400, margin: "0 auto", padding: 20 }}>
            <h2
                style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: "#222",
                    textTransform: "uppercase",
                    letterSpacing: 2,
                    marginBottom: 24,
                    textAlign: "center",
                    fontFamily: "Georgia, serif",
                }}
            >
                Admin Login
            </h2>

            <div style={{
                background: OFFWHITE,
                border: `1px solid ${GOLD}`,
                padding: 32,
                fontFamily: "Georgia, serif"
            }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 20 }}>
                        <label
                            htmlFor="email"
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
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: "100%",
                                padding: 12,
                                border: `1px solid ${GOLD}`,
                                fontFamily: "Georgia, serif",
                                fontSize: 15,
                                background: "white",
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label
                            htmlFor="password"
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
                            Password (min 8 characters)
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            style={{
                                width: "100%",
                                padding: 12,
                                border: `1px solid ${GOLD}`,
                                fontFamily: "Georgia, serif",
                                fontSize: 15,
                                background: "white",
                            }}
                        />
                        <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                            Password must be at least 8 characters long
                        </div>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label
                            htmlFor="adminPassword"
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
                            Admin Password
                        </label>
                        <input
                            id="adminPassword"
                            type="password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            required
                            style={{
                                width: "100%",
                                padding: 12,
                                border: `1px solid ${GOLD}`,
                                fontFamily: "Georgia, serif",
                                fontSize: 15,
                                background: "white",
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: "100%",
                            padding: "12px 0",
                            border: `1.5px solid ${GOLD}`,
                            background: isLoading ? "#f5f5f5" : GOLD,
                            color: isLoading ? "#888" : "white",
                            fontFamily: "Georgia, serif",
                            fontSize: 16,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: 1,
                            cursor: isLoading ? "not-allowed" : "pointer",
                            opacity: isLoading ? 0.7 : 1,
                        }}
                    >
                        {isLoading ? "Signing In..." : "Sign In as Admin"}
                    </button>
                </form>
            </div>
        </div>
    );
} 