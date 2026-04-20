import { Router } from "express";
import { getPosts, getPost, createPost, updatePost, deletePost, resolvePost } from "../controllers/postController.js";
import { auth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.get("/", getPosts);
router.get("/:id", getPost);
router.post("/", auth, upload.array("images", 3), createPost);
router.put("/:id", auth, upload.array("images", 3), updatePost);
router.delete("/:id", auth, deletePost);
router.patch("/:id/resolve", auth, resolvePost);

export default router;
