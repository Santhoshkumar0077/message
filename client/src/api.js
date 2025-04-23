import axios from "axios";

const api = axios.create({
  baseURL: "https://message-o80p.onrender.com",
  withCredentials: true,
});

export default api;
