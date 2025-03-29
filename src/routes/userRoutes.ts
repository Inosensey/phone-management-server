import express from "express";

import {
  getUsers,
  getUserRoles,
  registerUser,
  userSignIn,
  userSignOut,
  forgotPassword,
  changePassword,
  getAccountRequest,
  approveAccountRequest,
  activateUser,
  deactivateUser,
  updateUser,
  deleteUser,
  addUserThroughAdmin,
} from "../controllers/userController";
import { authenticateUser } from "../middlewares/authMiddleware";

const router = express();

router.get("/", authenticateUser, getUsers);
router.get("/account-request", authenticateUser, getAccountRequest);
router.get("/getUserRoles", getUserRoles);
router.post("/approve-account", approveAccountRequest);
router.post("/activate-account", activateUser);
router.post("/deactivate-account", deactivateUser);
router.post("/register-user", registerUser);
router.post("/sign-in", userSignIn);
router.post("/sign-out", userSignOut);
router.post("/forgot-password", forgotPassword);
router.post("/change-password", changePassword);
router.put("/update-user", updateUser);
router.delete("/delete-user", deleteUser)
router.post("/add-user", addUserThroughAdmin)

export default router;
