import Post from "../models/Post.js";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

export const getPosts = async (req, res, next) => {
  try {
    const { type, category, building, search, sort, page = 1, limit = 12, author } = req.query;

    const filter = {};
    if (!author) filter.status = "active";
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (building) filter["location.building"] = building;
    if (author) filter.author = author;
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ title: regex }, { description: regex }];
    }

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit))
        .populate("author", "name avatar"),
      Post.countDocuments(filter),
    ]);

    res.json({
      posts,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (err) {
    next(err);
  }
};

export const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "name email avatar");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    next(err);
  }
};

export const createPost = async (req, res, next) => {
  try {
    const images = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];
    if (images.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }
    if (images.length > 3) {
      return res.status(400).json({ message: "Maximum 3 images allowed" });
    }

    let location;
    try {
      location = JSON.parse(req.body.location);
    } catch {
      return res.status(400).json({ message: "Invalid location format" });
    }

    const post = await Post.create({
      type: req.body.type,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      images,
      location,
      dateLostFound: req.body.dateLostFound,
      contactPreference: req.body.contactPreference,
      author: req.user.id,
    });

    await User.findByIdAndUpdate(req.user.id, { $inc: { postsCount: 1 } });

    const populated = await post.populate("author", "name avatar");
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updates = { ...req.body };
    if (updates.location && typeof updates.location === "string") {
      try {
        updates.location = JSON.parse(updates.location);
      } catch {
        return res.status(400).json({ message: "Invalid location format" });
      }
    }
    if (req.files && req.files.length > 0) {
      updates.images = req.files.map((f) => `/uploads/${f.filename}`);
    }

    const updated = await Post.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate("author", "name avatar");
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const conversations = await Conversation.find({ post: post._id });
    const conversationIds = conversations.map((c) => c._id);
    await Message.deleteMany({ conversation: { $in: conversationIds } });
    await Conversation.deleteMany({ post: post._id });
    await post.deleteOne();
    await User.findByIdAndUpdate(req.user.id, { $inc: { postsCount: -1 } });
    res.json({ message: "Post deleted" });
  } catch (err) {
    next(err);
  }
};

export const resolvePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    post.status = "resolved";
    await post.save();

    await User.findByIdAndUpdate(req.user.id, { $inc: { returnsCount: 1 } });

    res.json(post);
  } catch (err) {
    next(err);
  }
};
