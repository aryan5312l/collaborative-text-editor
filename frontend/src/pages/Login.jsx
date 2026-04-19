import { useState } from "react";
import { setToken } from "../utils/auth";
import { useNavigate, Link } from "react-router-dom";
import { socket } from "../socket/socket";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        console.log("Hello");
        const res = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            console.log("Login successful, token:", data.token);
            setToken(data.token);
            localStorage.setItem("user", JSON.stringify(data));


            socket.auth = { token: data.token };
            socket.connect();

            navigate("/dashboard");
        } else {
            setError(data.message);
            console.error("Login failed:", data.message);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
            {error && <p>{error}</p>}
            <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
        </div>
    );
}