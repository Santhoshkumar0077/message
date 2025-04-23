import mongoose from "mongoose";
const chatSchema = new mongoose.Schema({
  members: {
    type: [String],
    required: true,
  },
  chats: {
    type: [
      {
        sender: { type: String, required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
});
export default mongoose.model("Chat", chatSchema);
