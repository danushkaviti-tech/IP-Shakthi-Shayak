import { NextResponse } from "next/server";
import crypto from "crypto";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, otp, token, password } = await req.json();

    if (!password) {
      return NextResponse.json(
        { success: false, error: "New password is required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("ip-sakti");
    const users = db.collection("users");

    let user: any = null;

    // Method 1: Verify using 6-Digit OTP + Email
    if (email && otp) {
      const normalizedEmail = email.toLowerCase().trim();
      const cleanOtp = String(otp).trim();
      const hashedOtp = crypto.createHash("sha256").update(cleanOtp).digest("hex");

      user = await users.findOne({
        email: normalizedEmail,
        $or: [
          { resetOtp: hashedOtp },
          { resetOtpCode: cleanOtp }
        ],
        resetOtpExpires: { $gt: new Date() },
      });

      if (!user) {
        return NextResponse.json(
          { success: false, error: "Invalid or expired verification code (OTP)." },
          { status: 400 }
        );
      }
    }
    // Method 2: Verify using Reset Token
    else if (token) {
      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

      user = await users.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!user) {
        return NextResponse.json(
          { success: false, error: "Reset link is invalid or has expired." },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Verification code (OTP) or reset token is required." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
        },
        $unset: {
          resetOtp: "",
          resetOtpCode: "",
          resetOtpExpires: "",
          resetPasswordToken: "",
          resetPasswordExpires: "",
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Unable to complete password reset." },
      { status: 500 }
    );
  }
}
