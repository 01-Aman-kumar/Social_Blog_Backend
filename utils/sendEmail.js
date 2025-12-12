import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false, // Gmail works with secure: false on port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export default async function sendEmail({ to, subject, text, html }) {
  return await transporter.sendMail({
    from: process.env.EMAIL_FROM, 
    to,
    subject,
    text,
    html,
  });
}
