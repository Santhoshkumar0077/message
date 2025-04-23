import React from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import api from "../api";
import { toast } from "react-toastify";
const Login = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [otpStatus, setOtpstatus] = React.useState(false);
  const [otp, setOtp] = React.useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", { email, password });
      setLoading(false);
      setOtpstatus(true);
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
        window.location.reload();
      }
    }
  };
  const handleVerify = async () => {
    setLoading(true);
    try {
      const res = await api.post("/api/auth/verify", { email, otp });
      setLoading(false);
      toast.success(res.data.message);
      setOtp("");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message);
        toast.error(error.response.data.message);
        setOtp("");
        setOtpstatus(false);
        window.location.reload();
      } else {
        setError("Something went wrong");
      }
    }
  };
  return (
    <div className="d-flex justify-content-center flex-column align-items-center vh-100">
      {otpStatus ? (
        <div className="mt-4 d-flex flex-column justify-content-center gap-2">
          <label htmlFor="otp">OTP sent to your mail...</label>
          <input
            type="text"
            id="otp"
            name="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Verify your OTP here.."
          />
          <button
            className="p-2 rounded btn btn-primary w-50"
            onClick={handleVerify}
          >
            Verify
          </button>
        </div>
      ) : (
        <form className="border p-4 rounded shadow" onSubmit={handleSubmit}>
          <h1>Login</h1>
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
          <button type="submit" className="p-2 rounded btn btn-primary w-50">
            {loading ? "loggin in" : "log in"}
          </button>
          {error && <p className="text-danger">{error}</p>}
        </form>
      )}
      <Link to={"/register"}>Create an account</Link>
    </div>
  );
};

export default Login;
