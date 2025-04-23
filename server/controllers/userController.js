import User from "../models/User.js";
import Chat from "../models/Chat.js";
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -otp -otpExpiresAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select(
      "-password -otp -otpExpiresAt"
    );

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const findOrCreateChat = async (req, res) => {
  const { loggedUser, selectedUser } = req.body;
  try {
    const chat = await Chat.findOne({
      members: { $all: [loggedUser, selectedUser] },
    });
    if (!chat) {
      const newChat = await Chat.create({
        members: [loggedUser, selectedUser],
        chats: [],
      });
      res.status(200).json(newChat);
    } else {
      res.status(200).json(chat);
    }
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const logout = async (req, res) => {
    try {
        res.clearCookie("token", { httpOnly: true, sameSite: "None", secure: true });
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Error logging out:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
