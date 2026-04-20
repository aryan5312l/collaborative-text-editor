import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function Landing() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const fadeInUp = {
        initial: { opacity: 0, y: 60 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#0a0f1a" }}>
            
            {/* Subtle grid pattern - not AI slop */}
            <div className="fixed inset-0 opacity-[0.02] pointer-events-none"
                style={{
                    backgroundImage: `repeating-linear-gradient(transparent, transparent 40px, rgba(100, 255, 218, 0.03) 40px, rgba(100, 255, 218, 0.03) 41px)`
                }}
            />

            {/* NAVBAR */}
            <motion.nav 
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    scrolled ? "backdrop-blur-xl border-b" : "bg-transparent"
                }`}
                style={{
                    backgroundColor: scrolled ? "rgba(10, 15, 26, 0.92)" : "transparent",
                    borderBottomColor: scrolled ? "rgba(100, 255, 218, 0.08)" : "transparent"
                }}
            >
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <motion.h1 
                        whileHover={{ scale: 1.02 }}
                        className="text-2xl font-mono tracking-tight cursor-pointer"
                        style={{ color: "#64ffda" }}
                        onClick={() => navigate("/")}
                    >
                        collabx<span style={{ color: "#839496" }}>.dev</span>
                    </motion.h1>

                    <div className="flex items-center gap-3">
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate("/login")} 
                            className="px-5 py-2 text-sm font-mono transition-colors"
                            style={{ color: "#839496" }}
                            onMouseEnter={(e) => e.currentTarget.style.color = "#64ffda"}
                            onMouseLeave={(e) => e.currentTarget.style.color = "#839496"}
                        >
                            ~/login
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate("/signup")}
                            className="px-5 py-2 text-sm font-mono transition-all"
                            style={{
                                backgroundColor: "rgba(100, 255, 218, 0.08)",
                                border: "1px solid rgba(100, 255, 218, 0.2)",
                                color: "#64ffda"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(100, 255, 218, 0.15)";
                                e.currentTarget.style.borderColor = "rgba(100, 255, 218, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(100, 255, 218, 0.08)";
                                e.currentTarget.style.borderColor = "rgba(100, 255, 218, 0.2)";
                            }}
                        >
                            $ get_started
                        </motion.button>
                    </div>
                </div>
            </motion.nav>

            {/* HERO SECTION */}
            <section className="relative pt-36 pb-20 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.div
                        initial="initial"
                        animate="animate"
                        variants={staggerContainer}
                    >
                        <motion.div variants={fadeInUp}>
                            <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full font-mono text-xs"
                                style={{
                                    backgroundColor: "rgba(100, 255, 218, 0.06)",
                                    border: "1px solid rgba(100, 255, 218, 0.12)",
                                    color: "#64ffda"
                                }}
                            >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#64ffda" }}></span>
                                <span>v2.0 · now with real-time sync</span>
                            </div>
                        </motion.div>

                        <motion.h1 
                            variants={fadeInUp}
                            className="text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.2]"
                        >
                            <span style={{ color: "#ccd6f6" }}>write together.</span>
                            <br />
                            <span style={{ color: "#64ffda" }}>in real time.</span>
                        </motion.h1>

                        <motion.p 
                            variants={fadeInUp}
                            className="text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
                            style={{ color: "#839496" }}
                        >
                            no refresh. no conflicts. just seamless collaboration with live cursors and instant sync.
                        </motion.p>

                        <motion.div 
                            variants={fadeInUp}
                            className="flex gap-4 justify-center flex-wrap"
                        >
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate("/dashboard")}
                                className="px-8 py-3.5 text-sm font-mono transition-all"
                                style={{
                                    backgroundColor: "#64ffda",
                                    color: "#0a0f1a"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#7cffea"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#64ffda"}
                            >
                                → start writing
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-8 py-3.5 text-sm font-mono transition-all"
                                style={{
                                    border: "1px solid rgba(100, 255, 218, 0.3)",
                                    color: "#64ffda",
                                    backgroundColor: "transparent"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = "#64ffda";
                                    e.currentTarget.style.backgroundColor = "rgba(100, 255, 218, 0.05)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = "rgba(100, 255, 218, 0.3)";
                                    e.currentTarget.style.backgroundColor = "transparent";
                                }}
                            >
                                ▶ watch demo
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* LIVE EDITOR MOCK */}
            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="relative"
                    >
                        {/* Editor header */}
                        <div className="rounded-t-xl px-4 py-3 flex items-center gap-2 border-b"
                            style={{
                                backgroundColor: "#0f1420",
                                borderBottomColor: "rgba(100, 255, 218, 0.1)"
                            }}
                        >
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#dc7a6c" }}></div>
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#e5b567" }}></div>
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#64ffda" }}></div>
                            </div>
                            <div className="flex-1 text-center text-xs font-mono" style={{ color: "#586e75" }}>
                                collaboration.md
                            </div>
                        </div>

                        <div className="rounded-b-xl p-6 relative min-h-[320px]"
                            style={{
                                backgroundColor: "#0b1018",
                                border: "1px solid rgba(100, 255, 218, 0.08)",
                                borderTop: "none"
                            }}
                        >
                            <textarea
                                readOnly
                                value={`# welcome to collabx\n\n> real-time collaborative editing, made simple.\n\n## features\n\n- live cursors with user avatars\n- instant document sync\n- version history & rollbacks\n\n---\n\nstart typing... your team sees changes instantly.`}
                                className="w-full h-52 bg-transparent outline-none resize-none font-mono text-sm leading-relaxed"
                                style={{ color: "#839496" }}
                            />

                            {/* Animated Cursors */}
                            <motion.div
                                animate={{ x: [0, 25, 0], y: [0, -3, 0] }}
                                transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
                                className="absolute top-[92px] left-8 flex items-center gap-1.5"
                            >
                                <div className="w-0.5 h-5" style={{ backgroundColor: "#e5b567" }}></div>
                                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded"
                                    style={{
                                        backgroundColor: "#e5b567",
                                        color: "#0a0f1a"
                                    }}
                                >
                                    alex
                                </span>
                            </motion.div>

                            <motion.div
                                animate={{ x: [0, -18, 0], y: [0, 4, 0] }}
                                transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut", delay: 0.6 }}
                                className="absolute top-[180px] left-[180px] flex items-center gap-1.5"
                            >
                                <div className="w-0.5 h-5" style={{ backgroundColor: "#64ffda" }}></div>
                                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded"
                                    style={{
                                        backgroundColor: "#64ffda",
                                        color: "#0a0f1a"
                                    }}
                                >
                                    sarah
                                </span>
                            </motion.div>

                            <motion.div
                                animate={{ x: [0, 12, 0], y: [0, -2, 0] }}
                                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 1.2 }}
                                className="absolute top-60 left-70 flex items-center gap-1.5"
                            >
                                <div className="w-0.5 h-5" style={{ backgroundColor: "#cb4b16" }}></div>
                                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded"
                                    style={{
                                        backgroundColor: "#cb4b16",
                                        color: "#fff"
                                    }}
                                >
                                    mike
                                </span>
                            </motion.div>
                        </div>

                        {/* status bar */}
                        <div className="mt-3 flex justify-between text-xs font-mono px-1"
                            style={{ color: "#586e75" }}
                        >
                            <span>3 collaborators online</span>
                            <span>last saved just now</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            

           

            {/* CTA */}
            <section className="py-24 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="rounded-2xl p-10 border"
                        style={{
                            backgroundColor: "rgba(100, 255, 218, 0.02)",
                            borderColor: "rgba(100, 255, 218, 0.1)"
                        }}
                    >
                        <h2 className="text-3xl font-bold tracking-tight mb-3"
                            style={{ color: "#ccd6f6" }}
                        >
                            ready to ship faster?
                        </h2>
                        <p className="text-base font-mono mb-8" style={{ color: "#839496" }}>
                            join thousands of teams already collaborating in real-time.
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate("/signup")}
                                className="px-8 py-3.5 text-sm font-mono transition-all"
                                style={{
                                    backgroundColor: "#64ffda",
                                    color: "#0a0f1a"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#7cffea"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#64ffda"}
                            >
                                $ npm install collabx
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate("/contact")}
                                className="px-8 py-3.5 text-sm font-mono transition-all"
                                style={{
                                    border: "1px solid rgba(100, 255, 218, 0.3)",
                                    color: "#64ffda"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = "#64ffda";
                                    e.currentTarget.style.backgroundColor = "rgba(100, 255, 218, 0.05)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = "rgba(100, 255, 218, 0.3)";
                                    e.currentTarget.style.backgroundColor = "transparent";
                                }}
                            >
                                /contact
                            </motion.button>
                        </div>
                        <p className="text-xs font-mono mt-6" style={{ color: "#586e75" }}>
                            free for up to 5 users · no credit card required
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-8 px-6 border-t"
                style={{ borderTopColor: "rgba(100, 255, 218, 0.06)" }}
            >
                <div className="max-w-6xl mx-auto flex justify-between items-center flex-wrap gap-4">
                    <div className="text-xs font-mono" style={{ color: "#586e75" }}>
                        © 2024 collabx — MIT licensed
                    </div>
                    <div className="flex gap-6">
                        {["privacy", "terms", "github", "twitter"].map((item) => (
                            <a
                                key={item}
                                href="#"
                                className="text-xs font-mono transition-colors"
                                style={{ color: "#586e75" }}
                                onMouseEnter={(e) => e.currentTarget.style.color = "#64ffda"}
                                onMouseLeave={(e) => e.currentTarget.style.color = "#586e75"}
                            >
                                ~/{item}
                            </a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description, color }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="group p-6 rounded-xl border transition-all duration-300"
            style={{
                backgroundColor: "rgba(15, 20, 32, 0.6)",
                borderColor: "rgba(100, 255, 218, 0.08)"
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${color}40`;
                e.currentTarget.style.backgroundColor = "rgba(100, 255, 218, 0.02)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(100, 255, 218, 0.08)";
                e.currentTarget.style.backgroundColor = "rgba(15, 20, 32, 0.6)";
            }}
        >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-4 transition-transform group-hover:scale-105"
                style={{
                    backgroundColor: `${color}15`,
                    color: color
                }}
            >
                {icon}
            </div>
            <h3 className="text-lg font-mono font-medium mb-2 tracking-tight"
                style={{ color: "#ccd6f6" }}
            >
                {title}
            </h3>
            <p className="text-sm leading-relaxed font-mono" style={{ color: "#839496" }}>
                {description}
            </p>
        </motion.div>
    );
}

function StatItem({ value, label }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
        >
            <div className="text-3xl font-mono font-bold tracking-tight"
                style={{ color: "#64ffda" }}
                dangerouslySetInnerHTML={{ __html: value }}
            />
            <div className="text-xs font-mono mt-1.5 tracking-wide"
                style={{ color: "#586e75" }}
            >
                {label}
            </div>
        </motion.div>
    );
}