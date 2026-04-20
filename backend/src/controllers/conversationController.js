import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Post from "../models/Post.js";

export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .populate("participants", "name avatar")
      .populate("post", "title type status images author")
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    next(err);
  }
};

export const createConversation = async (req, res, next) => {
  try {
    const { postId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() === req.user.id) {
      return res.status(400).json({ message: "Cannot start a conversation on your own post" });
    }

    const existing = await Conversation.findOne({
      post: postId,
      participants: { $all: [req.user.id, post.author] },
    }).populate("participants", "name avatar").populate("post", "title type status images author");
    if (existing) {
      return res.json(existing);
    }

    let conversation;
    try {
      conversation = await Conversation.create({
        participants: [req.user.id, post.author],
        post: postId,
      });
    } catch (err) {
      if (err.code === 11000) {
        const dup = await Conversation.findOne({
          post: postId,
          participants: { $all: [req.user.id, post.author] },
        }).populate("participants", "name avatar").populate("post", "title type status images author");
        return res.json(dup);
      }
      throw err;
    }

    const populated = await conversation.populate([
      { path: "participants", select: "name avatar" },
      { path: "post", select: "title type status images" },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user.id
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Message.updateMany(
      { conversation: req.params.id, sender: { $ne: req.user.id }, read: false },
      { read: true }
    );

    const messages = await Message.find({ conversation: req.params.id })
      .populate("sender", "name avatar")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user.id
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const message = await Message.create({
      conversation: req.params.id,
      sender: req.user.id,
      content: req.validated.content,
    });

    conversation.lastMessage = {
      content: message.content,
      sender: req.user.id,
      timestamp: message.createdAt,
    };
    await conversation.save();

    const populated = await message.populate("sender", "name avatar");
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};
