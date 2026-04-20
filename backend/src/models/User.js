import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    studentId: { type: String, default: "" },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 300 },
    phone: { type: String, default: "" },
    studyProgram: { type: String, default: "" },
    links: {
      linkedin: { type: String, default: "" },
      facebook: { type: String, default: "" },
      website: { type: String, default: "" },
    },
    postsCount: { type: Number, default: 0 },
    returnsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);


export default mongoose.model("User", userSchema);
