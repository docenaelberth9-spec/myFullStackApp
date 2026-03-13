import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    verificationToken: String, // for Verification
    verificationTokenExpires: Date,

    resetPasswordToken: String, // for reset Password
    resetPasswordExpires: Date,

    lastLogin: Date
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);