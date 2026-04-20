import { Router } from "express";
import { getConversations, createConversation, getMessages, sendMessage } from "../controllers/conversationController.js";
import { auth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { messageSchema } from "../../../shared/schemas/message.js";

const router = Router();

router.get("/", auth, getConversations);
router.post("/", auth, createConversation);
router.get("/:id/messages", auth, getMessages);
router.post("/:id/messages", auth, validate(messageSchema), sendMessage);

export default router;
