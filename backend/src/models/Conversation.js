import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    lastMessage: {
      content: String,
      sender: mongoose.Schema.Types.ObjectId,
      timestamp: Date,
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ post: 1 });

export default mongoose.model("Conversation", conversationSchema);
