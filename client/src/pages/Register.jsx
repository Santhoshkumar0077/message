import React, { useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (username.length < 5) {
      return toast.error("Username must be at least 5 characters long");
    }
    if (password.length < 8) {
      return toast.error("Password must be at least 8 characters long");
    }
    const lowerCase = username.toLowerCase();
    try {
      const res = await api.post("/api/auth/register", {
        username: lowerCase,
        email,
        password,
      });
      toast.success(res.data.message);
      setUsername("");
      setEmail("");
      setPassword("");
      setLoading(false);
      navigate("/login");
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message);
        toast.error(error.response.data.message);
        window.location.reload()
      } else {
        setError("Something went wrong");
      }
    }
  };
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <form className="border p-4 rounded shadow" onSubmit={handleSubmit}>
        <h1>Register</h1>
        <div className="mb-3 d-flex flex-column gap-2">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            required
            onChange={(e) => setUsername(e.target.value)}
            value={username}
          />
        </div>
        <div className="mb-3 d-flex flex-column gap-2">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </div>
        <div className="mb-3 d-flex flex-column gap-2">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="p-2 rounded btn btn-primary d-block mb-3"
        >
          {loading ? "Registering" : "Register"}
        </button>
        {error && <div className="text-danger">{error}</div>}
        <Link to="/login">Already have an acccount</Link>
      </form>
    </div>
  );
};

export default Register;
