import nodemailer from "nodemailer";

import * as dotenv from "dotenv";
dotenv.config();

const email = process.env.NODEMAILER_GOOGLE_EMAIL;
const pass = process.env.NODEMAILER_GOOGLE_PASS;

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email,
    pass,
  },
});

export const mailOptions = {
  from: email,
};