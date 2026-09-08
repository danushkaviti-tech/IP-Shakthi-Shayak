import { NextResponse } from "next/server";
import crypto from "crypto";
import clientPromise from "@/lib/mongodb";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email address is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("ip-sakti");
    const users = db.collection("users");

    const normalizedEmail = email.toLowerCase().trim();

    const user = await users.findOne({
      email: normalizedEmail,
    });

    // Generate a 6-digit numeric OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const rawToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const hashedOtp = crypto
      .createHash("sha256")
      .update(otpCode)
      .digest("hex");

    const otpExpires = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes
    const tokenExpires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

    if (user) {
      await users.updateOne(
        { _id: user._id },
        {
          $set: {
            resetOtp: hashedOtp,
            resetOtpCode: otpCode,
            resetOtpExpires: otpExpires,
            resetPasswordToken: hashedToken,
            resetPasswordExpires: tokenExpires,
          },
        }
      );

      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL || "https://ip-sakti-seven.vercel.app";

      const resetUrl = `${appUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(normalizedEmail)}`;

      if (resendApiKey) {
        try {
          const resend = new Resend(resendApiKey);
          await resend.emails.send({
            from: process.env.RESEND_FROM || "onboarding@resend.dev",
            to: normalizedEmail,
            subject: "Your IP-SAKTI Verification Code: " + otpCode,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070709; color: #f4f4f7; padding: 24px; margin: 0; }
                  .container { max-width: 520px; margin: 0 auto; background-color: #0e0e14; border: 1px solid #1e1e28; border-radius: 16px; padding: 32px; }
                  .logo { font-size: 20px; font-weight: bold; color: #ffffff; margin-bottom: 20px; }
                  .otp-badge { background-color: #161622; border: 1px solid #2a2a3e; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
                  .otp-code { font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #10b981; }
                  .btn { display: inline-block; background-color: #ffffff; color: #070709; text-decoration: none; font-weight: 600; font-size: 13px; padding: 12px 24px; border-radius: 10px; margin: 16px 0; }
                  .footer { font-size: 11px; color: #71717a; margin-top: 24px; border-top: 1px solid #1e1e28; padding-top: 16px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="logo">⚡ IP-SAKTI Intelligence</div>
                  <h3 style="color: #ffffff; margin-top: 0;">Password Reset Verification Code</h3>
                  <p style="color: #a1a1aa; font-size: 14px; line-height: 1.5;">Hello ${user.name || "Researcher"},</p>
                  <p style="color: #a1a1aa; font-size: 14px; line-height: 1.5;">Use the following 6-digit verification code to reset your account password. This code is valid for <strong>15 minutes</strong>.</p>
                  
                  <div class="otp-badge">
                    <div style="font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Your 6-Digit Verification Code</div>
                    <div class="otp-code">${otpCode}</div>
                  </div>

                  <p style="color: #a1a1aa; font-size: 13px;">Or click the secure button below to set a new password directly:</p>
                  <div style="text-align: center;">
                    <a href="${resetUrl}" class="btn">Set New Password</a>
                  </div>

                  <div class="footer">
                    If you did not request this password reset, please ignore this email or contact support. IP-SAKTI Regulatory Intelligence.
                  </div>
                </div>
              </body>
              </html>
            `,
          });
        } catch (mailErr) {
          console.error("Resend email dispatch error:", mailErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a 6-digit verification code has been sent.",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Unable to process password reset request." },
      { status: 500 }
    );
  }
}