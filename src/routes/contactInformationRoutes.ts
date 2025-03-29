import express from "express";
const router = express.Router();
import upload from "../config/CloudinaryConfig";

// Controllers
import {
  addContactInformation,
  deleteContactInformation,
  deleteSharedContact,
  getContactInformation,
  getMySharedContactInformation,
  getSharedContactInformation,
  getUserContactInformation,
  shareInformationToAUser,
  updateContactInformation,
} from "../controllers/contactInformationController";

// Middlewares
import { authenticateUser } from "../middlewares/authMiddleware";

router.get("/", authenticateUser, getContactInformation);
router.get(
  "/user-contacts/:userId",
  authenticateUser,
  getUserContactInformation
);
router.get(
  "/shared-contacts/:contactShareTo",
  authenticateUser,
  getSharedContactInformation
);
router.get(
  "/my-shared-contacts/:contactOwnerId",
  authenticateUser,
  getMySharedContactInformation
);
router.post(
  "/add-contact-information",
  upload.single("image"),
  addContactInformation
);
router.post("/share-contact-information", shareInformationToAUser);
router.put(
  "/update-contact-information",
  upload.single("image"),
  updateContactInformation
);
router.delete("/delete-contact-information", deleteContactInformation);
router.delete("/delete-share-contact", deleteSharedContact);

export default router;
