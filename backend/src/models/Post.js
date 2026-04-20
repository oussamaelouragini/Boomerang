import mongoose from "mongoose";
import { CATEGORIES, POST_TYPES, POST_STATUSES, CONTACT_PREFERENCES } from "../../../shared/constants/categories.js";

const postSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, enum: POST_TYPES },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, enum: CATEGORIES },
    images: [{ type: String }],
    location: {
      building: { type: String, required: true },
      area: { type: String, required: true },
    },
    dateLostFound: { type: Date, required: true },
    contactPreference: { type: String, required: true, enum: CONTACT_PREFERENCES },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: POST_STATUSES, default: "active" },
  },
  { timestamps: true }
);

postSchema.index({ category: 1, status: 1 });
postSchema.index({ author: 1 });

export default mongoose.model("Post", postSchema);
