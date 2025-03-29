import mongoose from "mongoose";
import { contactInfoTypes } from "../types/ContactType";

const contactSchema = new mongoose.Schema<contactInfoTypes>({
    user_id: { type: Number, required: [true, "User not found"] },
    first_name: { type: String, required: [true, "You must provide a First name"] },
    last_name: { type: String, required: [true, "You must provide a Last name"] },
    contact_number: { type: String, required: [true, "You provide a Contact Number"] },
    email_address: { type: String, default: "none" },
    contact_profile_photo: { type: String, default: "none" },
});

const phoneBook = mongoose.model<contactInfoTypes>("user-phone-books", contactSchema);

export default phoneBook;
