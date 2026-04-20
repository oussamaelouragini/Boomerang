import { Router } from "express";
import { register, login, refresh, getMe, getUser, updateProfile, changePassword, logout } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { auth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { registerSchema, loginSchema } from "../../../shared/schemas/auth.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", auth, getMe);
router.get("/users/:id", getUser);
router.put("/profile", auth, upload.single("avatar"), updateProfile);
router.put("/password", auth, changePassword);

export default router;
