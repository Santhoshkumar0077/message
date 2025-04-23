import React, { useEffect, useState, useRef } from "react";
import api from "../api";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const socket = io("http://localhost:5000");
const Home = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [loggedUser, setLoggedUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [chat, setChat] = useState([]);
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");
  const bottomRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleUserClick = (user) => {
    setSelectedUser(user.username);
    const fetchChat = async () => {
      try {
        const response = await api.post("/api/auth/findOrCreateChat", {
          loggedUser: loggedUser,
          selectedUser: user.username,
        });
        setChat(response.data);
        socket.emit("joinRoom", { chatId: response.data._id });
      } catch (error) {
        console.error("Error fetching chat:", error);
        setChat([]);
      }
    };
    fetchChat();
  };

  const handleBack = () => {
    setSelectedUser(null);
    setChat([]);
  };
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/api/auth/me");
        setLoggedUser(response.data.username);
      } catch (error) {
        console.error("Error fetching user:", error);
        navigate("/login");
        toast.error("please login");
      }
    };
    const fetchAllUser = async () => {
      try {
        const response = await api.get("/api/auth/all");
        setFilteredUsers(response.data);
        setAllUsers(response.data);
      } catch (error) {
        console.error("Error fetching all users:", error);
        navigate("/login");

      }
    };
    fetchUser();
    fetchAllUser();
  }, []);
  const handleChange = (e) => {
    setType(e.target.value);
    if (type.trim() === "") {
      setFilteredUsers(allUsers);
    } else {
      const filtered = allUsers.filter((user) =>
        user.username.toLowerCase().includes(type.toLowerCase()),
      );
      setFilteredUsers(filtered);
    }
  };
  const handleSend = () => {
    if (message.trim() === "") return;
    const newMessage = {
      sender: loggedUser,
      message: message,
      timestamp: new Date().toISOString(),
    };
    socket.emit("receiveMessage", { chatId: chat._id, message: newMessage });
    setMessage("");
  };
  useEffect(() => {
    socket.on("sendMessage", (data) => {
      setChat((prev) => ({ ...prev, chats: [...prev.chats, data] }));
    });
    return () => {
      socket.off("sendMessage");
    };
  }, []);
  return (
    <div className="container-fluid vh-100 overflow-hidden">
      {loggedUser && <div className="row h-100">
        <div
          className={`${selectedUser ? "d-none d-md-block" : "d-block"
            } col-12 col-md-3 col-lg-3 bg-light border-end p-3`}
        >
          <div className="d-flex justify-content-between align-items-center mb-3" style={{ columnGap: "30px" }}>
            <h5 className="border p-2">Welcome {loggedUser}</h5>
            <h5
              className="btn btn-danger"
              onClick={async () => {
                await api.post("/api/auth/logout");
                navigate("/login");
              }}
            >
              logout
            </h5>
          </div>
          <input
            type="text"
            onChange={handleChange}
            placeholder="Type here username..."
            className="d-block mb-3 form-control"
          />
          <ul
            className="list-group overflow-auto"
            style={{ maxHeight: "80vh" }}
          >
            {filteredUsers.map((user, index) => (
              <li
                key={index}
                className="list-group-item list-group-item-action"
                onClick={() => handleUserClick(user)}
              >
                {user.username}
              </li>
            ))}
          </ul>
        </div>
        <div
          className={`${selectedUser ? "d-block" : "d-none"
            } col-12 col-md-9 col-lg-9 d-flex flex-column p-3`}
        >
          {/* Back Button for Mobile */}
          <div className="d-flex mb-2 align-items-center" style={{ columnGap: "30px" }}>
            <button className="btn btn-sm btn-secondary" onClick={handleBack}>
              ← Back
            </button>
            <h5 className="mb-3">Chat to {selectedUser}</h5>
          </div>

          <div
            className="flex-grow-1 border rounded p-3 mb-2 bg-white d-flex flex-column"
            style={{ overflowY: "auto", maxHeight: "80vh" }}
          >
            {chat && chat.chats && chat.chats.length > 0 ? (
              chat.chats.map((message, index) => (
                <div
                  key={index}
                  style={{
                    width: "fit-content",
                    maxWidth: "70%",
                    padding: "10px",
                    borderRadius: "12px",
                    fontWeight: "bold",
                    backgroundColor:
                      message.sender === loggedUser ? "#DCF8C6" : "#F1F0F0",

                    alignSelf:
                      message.sender === loggedUser ? "flex-end" : "flex-start",
                  }}
                  className={`mb-2`}
                  ref={bottomRef}
                >
                  {message.message}
                  <div
                    className="text-muted fs-6 mt-2 "

                  >
                    {new Date(message.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <p>No messages yet</p>
            )}

          </div>

          <div
            className="d-flex align-items-center "
            style={{ columnGap: "10px" }}
          >
            <input
              type="text"
              className="form-control"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <button onClick={handleSend} className="btn btn-secondary">
              Send
            </button>
          </div>
        </div>
      </div>}
    </div>
  );
};

export default Home;
