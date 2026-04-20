import { useState } from "react";
import { setToken } from "../utils/auth";
import { useNavigate, Link } from "react-router-dom";
import { socket } from "../socket/socket";
import { motion } from "framer-motion";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        setIsLoading(true);
        setError("");
        
        try {
            const res = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                setToken(data.token);
                localStorage.setItem("user", JSON.stringify(data));

                socket.auth = { token: data.token };
                socket.connect();

                navigate("/dashboard");
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !isLoading) {
            handleLogin();
        }
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#0a0f1a" }}>
            {/* Subtle grid pattern */}
            <div className="fixed inset-0 opacity-[0.02] pointer-events-none"
                style={{
                    backgroundImage: `repeating-linear-gradient(transparent, transparent 40px, rgba(100, 255, 218, 0.03) 40px, rgba(100, 255, 218, 0.03) 41px)`
                }}
            />

            {/* Back to home button */}
            <div className="fixed top-6 left-6 z-10">
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-all"
                    style={{
                        color: "#839496",
                        backgroundColor: "rgba(100, 255, 218, 0.03)",
                        border: "1px solid rgba(100, 255, 218, 0.08)"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#64ffda";
                        e.currentTarget.style.borderColor = "rgba(100, 255, 218, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = "#839496";
                        e.currentTarget.style.borderColor = "rgba(100, 255, 218, 0.08)";
                    }}
                >
                    <span>←</span>
                    <span>~/home</span>
                </motion.button>
            </div>

            {/* Main content */}
            <div className="relative min-h-screen flex items-center justify-center px-6 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                    className="w-full max-w-md"
                >
                    {/* Header */}
                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h1 className="text-3xl font-mono font-bold tracking-tight mb-2"
                                style={{ color: "#ccd6f6" }}
                            >
                                sign in to <span style={{ color: "#64ffda" }}>collabx</span>
                            </h1>
                            <p className="text-sm font-mono" style={{ color: "#586e75" }}>
                                ~/auth/login
                            </p>
                        </motion.div>
                    </div>

                    {/* Login Form Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-2xl p-8 border"
                        style={{
                            backgroundColor: "rgba(15, 20, 32, 0.6)",
                            borderColor: "rgba(100, 255, 218, 0.1)",
                            backdropFilter: "blur(20px)"
                        }}
                    >
                        {/* Email Input */}
                        <div className="mb-6">
                            <label className="block text-xs font-mono mb-2 tracking-wide"
                                style={{ color: "#839496" }}
                            >
                                email@address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="w-full px-4 py-3 rounded-lg font-mono text-sm transition-all outline-none"
                                style={{
                                    backgroundColor: "rgba(10, 15, 26, 0.8)",
                                    border: "1px solid rgba(100, 255, 218, 0.15)",
                                    color: "#ccd6f6"
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = "#64ffda";
                                    e.currentTarget.style.backgroundColor = "rgba(10, 15, 26, 1)";
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = "rgba(100, 255, 218, 0.15)";
                                    if (!e.currentTarget.value) {
                                        e.currentTarget.style.backgroundColor = "rgba(10, 15, 26, 0.8)";
                                    }
                                }}
                                placeholder="alex@collabx.dev"
                            />
                        </div>

                        {/* Password Input */}
                        <div className="mb-8">
                            <label className="block text-xs font-mono mb-2 tracking-wide"
                                style={{ color: "#839496" }}
                            >
                                password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="w-full px-4 py-3 rounded-lg font-mono text-sm transition-all outline-none"
                                style={{
                                    backgroundColor: "rgba(10, 15, 26, 0.8)",
                                    border: "1px solid rgba(100, 255, 218, 0.15)",
                                    color: "#ccd6f6"
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = "#64ffda";
                                    e.currentTarget.style.backgroundColor = "rgba(10, 15, 26, 1)";
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = "rgba(100, 255, 218, 0.15)";
                                    if (!e.currentTarget.value) {
                                        e.currentTarget.style.backgroundColor = "rgba(10, 15, 26, 0.8)";
                                    }
                                }}
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-3 rounded-lg border-l-4"
                                style={{
                                    backgroundColor: "rgba(203, 75, 22, 0.08)",
                                    borderLeftColor: "#cb4b16",
                                    color: "#e5b567"
                                }}
                            >
                                <p className="text-xs font-mono">
                                    ✗ {error}
                                </p>
                            </motion.div>
                        )}

                        {/* Login Button */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={handleLogin}
                            disabled={isLoading}
                            className="w-full py-3 rounded-lg font-mono text-sm transition-all relative overflow-hidden"
                            style={{
                                backgroundColor: isLoading ? "rgba(100, 255, 218, 0.4)" : "#64ffda",
                                color: "#0a0f1a"
                            }}
                            onMouseEnter={(e) => {
                                if (!isLoading) {
                                    e.currentTarget.style.backgroundColor = "#7cffea";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isLoading) {
                                    e.currentTarget.style.backgroundColor = "#64ffda";
                                }
                            }}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" style={{ color: "#0a0f1a" }}>
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    authenticating...
                                </span>
                            ) : (
                                "$ ./login"
                            )}
                        </motion.button>

                        {/* Sign Up Link */}
                        <div className="mt-8 text-center">
                            <p className="text-xs font-mono" style={{ color: "#586e75" }}>
                                no account?{" "}
                                <Link
                                    to="/signup"
                                    className="transition-colors"
                                    style={{ color: "#64ffda" }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = "#7cffea"}
                                    onMouseLeave={(e) => e.currentTarget.style.color = "#64ffda"}
                                >
                                    ~/signup
                                </Link>
                            </p>
                        </div>
                    </motion.div>

                    {/* Terminal hint */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-8 text-center"
                    >
                        <p className="text-xs font-mono" style={{ color: "#586e75" }}>
                            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: "#64ffda" }}></span>
                            secure · end-to-end encrypted
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}