import { NextResponse } from "next/server";
import crypto from "crypto";
import clientPromise from "@/lib/mongodb";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
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

    // Don't reveal whether an account exists
    if (!user) {
      return NextResponse.json({
        message: "If the account exists, a reset link has been sent.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          resetPasswordToken: hashedToken,
          resetPasswordExpires: expiresAt,
        },
      }
    );

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const resetUrl =
      `${appUrl}/reset-password?token=${rawToken}`;

    await resend.emails.send({
      from: process.env.RESEND_FROM || "onboarding@resend.dev",
      to: normalizedEmail,
      subject: "Reset your IP-SAKTI password",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px">

          <h2 style="color:#7c3aed">
            IP-SAKTI Sahayak
          </h2>

          <p>
            Hello ${user.name || "there"},
          </p>

          <p>
            We received a request to reset your IP-SAKTI account password.
          </p>

          <a
            href="${resetUrl}"
            style="
              display:inline-block;
              padding:14px 24px;
              background:#7c3aed;
              color:white;
              text-decoration:none;
              border-radius:8px;
              margin:15px 0;
            "
          >
            Reset Password
          </a>

          <p>
            This link will expire in <strong>30 minutes</strong>.
          </p>

          <p>
            If you did not request this, you can safely ignore this email.
          </p>

          <hr />

          <p style="color:#777;font-size:12px">
            IP-SAKTI Sahayak
          </p>

        </div>
      `,
    });

    return NextResponse.json({
      message: "If the account exists, a reset link has been sent.",
    });

  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    return NextResponse.json(
      { error: "Unable to process password reset." },
      { status: 500 }
    );
  }
}