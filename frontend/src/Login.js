import React, { useState } from "react";
import "./Auth.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {

    const navigate = useNavigate();

    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(
                "http://localhost:5000/api/login",
                { phone, password }
            );

            if (res.data.msg) {
                setMessage(res.data.msg);
                return;
            }

            localStorage.setItem("name", res.data.name);
            localStorage.setItem("score", res.data.honest_score);
            localStorage.setItem("role", res.data.role);
            localStorage.setItem("user_id", res.data.id);

            if (res.data.role === "admin") {
                navigate("/admin");
            } else if (res.data.role === "worker") {
                navigate("/worker");
            } else {
                navigate("/user");
            }

        } catch (error) {
            setMessage("Server Error");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Trust-Local🤝</h2>

                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit">Login</button>
                </form>

                {message && <p className="error-message">{message}</p>}

                <p>
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
