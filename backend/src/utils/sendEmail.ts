import nodemailer from "nodemailer";

interface EmailOptions {
  email: string;
  subject: string;
  message?: string;
  html?: string;
}

const sendEmail = async (options: EmailOptions): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST!,
    port: parseInt(process.env.EMAIL_PORT!),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || "Knowledge Base"} <${process.env
      .EMAIL_USER!}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(message);
  console.log("Message sent: %s", info.messageId);
};

export default sendEmail;
