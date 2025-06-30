import crypto from "crypto";
import { Request, Response } from "express";
import User from "../models/User";
import generateToken from "../utils/generateToken";
import sendEmail from "../utils/sendEmail";

const APP_URL = process.env.FRONTEND_URL;
const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      res.status(400).json({
        message: "User already exists with this email or username",
      });
      return;
    }

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(20).toString("hex");

    const user = await User.create({
      username,
      email,
      password,
      isEmailVerified: false,
      emailVerificationToken: crypto
        .createHash("sha256")
        .update(emailVerificationToken)
        .digest("hex"),
      emailVerificationExpire: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    if (user) {
      // Send verification email
      const verifyUrl = `${APP_URL}/verify-email/${emailVerificationToken}`;

      const message = `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="color: #333;">Welcome to Knowledge Base Platform!</h1>
          <p>Thank you for registering! Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all;">${verifyUrl}</p>
          <p><strong>This link will expire in 24 hours.</strong></p>
          <p>If you did not create an account, please ignore this email.</p>
        </div>
      `;

      try {
        await sendEmail({
          email: user.email,
          subject: "Please verify your email - Knowledge Base Platform",
          html: message,
        });

        res.status(201).json({
          message:
            "Registration successful! Please check your email to verify your account.",
          email: user.email,
        });
      } catch (emailError) {
        console.error("Email sending error:", emailError);
        // Delete the user if email fails to send
        await User.findByIdAndDelete(user._id);
        res.status(500).json({
          message:
            "Registration failed. Unable to send verification email. Please try again.",
        });
      }
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Check if email is verified
      if (!user.isEmailVerified) {
        res.status(401).json({
          message:
            "Please verify your email before logging in. Check your inbox for the verification link.",
        });
        return;
      }

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        token: generateToken(user._id as string),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${APP_URL}/reset-password/${resetToken}`;

    const message = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #333;">Password Reset Request</h1>
        <p>You are receiving this email because you (or someone else) has requested a password reset for your Knowledge Base Platform account.</p>
        <p>Please click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">${resetUrl}</p>
        <p><strong>This link will expire in 10 minutes.</strong></p>
        <p>If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Request - Knowledge Base Platform",
        html: message,
      });

      res.status(200).json({ message: "Email sent" });
    } catch (err) {
      console.log(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      res.status(500).json({ message: "Email could not be sent" });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({ message: "Invalid token" });
      return;
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id as string),
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    const emailVerificationToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      res
        .status(401)
        .json({ message: "Invalid or expired verification token" });
      return;
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.status(200).json({
      message: "Email verified successfully! You can now log in.",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ message: "Server error during email verification" });
  }
};

const resendVerificationEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({ message: "Email is already verified" });
      return;
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(20).toString("hex");

    user.emailVerificationToken = crypto
      .createHash("sha256")
      .update(emailVerificationToken)
      .digest("hex");
    user.emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await user.save({ validateBeforeSave: false });

    const verifyUrl = `${APP_URL}/verify-email/${emailVerificationToken}`;

    const message = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #333;">Verify Your Email - Knowledge Base Platform</h1>
        <p>Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">${verifyUrl}</p>
        <p><strong>This link will expire in 24 hours.</strong></p>
        <p>If you did not request this email, please ignore it.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Verify Your Email - Knowledge Base Platform",
        html: message,
      });

      res.status(200).json({ message: "Verification email sent" });
    } catch (err) {
      console.log(err);
      user.emailVerificationToken = undefined;
      user.emailVerificationExpire = undefined;

      await user.save({ validateBeforeSave: false });

      res.status(500).json({ message: "Email could not be sent" });
    }
  } catch (error) {
    console.error("Resend verification email error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
};
