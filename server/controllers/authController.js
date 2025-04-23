import bcrypt from "bcryptjs";
import User from "../models/User.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "Email aleary exist" });
      return;
    }
    const hashedPwd = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPwd });
    await newUser.save();
    res.status(201).json({ message: "User registered succesfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiration = Date.now() + 2 * 60 * 1000;
    user.otp = otp;
    user.otpExpiresAt = otpExpiration;
    await user.save();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It is valid for 2 minute.`,
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.otp !== parseInt(otp)) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  if (new Date() > user.otpExpiresAt) {
    return res.status(400).json({ message: "OTP expired" });
  }

  user.otp = null;
  user.otpExpiresAt = null;
  await user.save();
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 3600000, 
  });

  res.json({ message: "OTP verified successfully" });
};
