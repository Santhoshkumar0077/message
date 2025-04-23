import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    otp: {
      type: Number,
      default: null,
    },
    otpExpiresAt: {
      type:Date,
      default:null,
    },

  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);
export default User;
