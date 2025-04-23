import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoute from "./routes/authRoute.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./routes/userRoute.js";
import http from "http";
import { Server } from "socket.io";
import Chat from "./models/Chat.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use("/api/auth", authRoute);
app.use("/api/auth", userRoute);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
io.on("connection", (socket) => {

  socket.on("joinRoom", (data) => {
    socket.join(data.chatId);
  });
  socket.on("receiveMessage", async (data) => {
    io.to(data.chatId).emit("sendMessage", data.message);
    const chat = await Chat.findById(data.chatId);
    if (chat) {
      chat.chats.push(data.message);
      await chat.save();
    } else {
      console.log("chat not found");
    }
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});
mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    server.listen(process.env.PORT, () => {
      console.log(`server runs on ${process.env.PORT}`);
    })
  )
  .catch((error) => console.error("Mongodb connection error", error));
