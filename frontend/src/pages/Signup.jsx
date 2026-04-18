import {useState} from "react";
import { useNavigate } from "react-router-dom";
import { setToken } from "../utils/auth";
import { socket } from "../socket/socket";

export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSignup = async () => {
        const res = await fetch("http://localhost:5000/api/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            setToken(data.token);
            socket.auth = { token: data.token };
            socket.connect();
            navigate("/doc/1");
        } else {
            setError(data.message);
        }
    };

    return (
        <div>
            <h2>Signup</h2>
            <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
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
            <button onClick={handleSignup}>Signup</button>
            {error && <p>{error}</p>}
        </div>
    );
}