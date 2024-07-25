import { NextRequest, NextResponse } from "next/server";
import { generateAccessToken } from "./../../../../utils/generateToken";
import { authMsg } from "./../../../../utils/mailMsg";
import { validateEmail } from "./../../../../utils/validator";
import connectDB from "./../../../../libs/db";
import User from "./../../../../models/User";
import sendEmail from "./../../../../utils/sendMail";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email } = await req.json();
    if (!email) {
      return new NextResponse(
        JSON.stringify({ msg: "Please provide email address." }),
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return new NextResponse(
        JSON.stringify({ msg: "Please provide valid email address." }),
        { status: 400 }
      );
    }

    const findUser = await User.findOne({ email });
    if (!findUser) {
      return new NextResponse(JSON.stringify({ msg: "Email not found." }), {
        status: 404,
      });
    }

    const token = generateAccessToken({ email });
    const url = `${process.env.CLIENT_URL}/reset/${token}`;
    const emailMsg = authMsg("Reset Password", url);

    await sendEmail(email, "Reset Password", emailMsg);

    return new NextResponse(
      JSON.stringify({
        msg: "Reset password link has been sent to your email.",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ msg: "Internal Server Error" }),
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return new NextResponse(
    JSON.stringify({
      msg: `${req.method} method is not allowed for this endpoint`,
    }),
    { status: 405 }
  );
}

export async function PATCH(req: NextRequest) {
  return new NextResponse(
    JSON.stringify({
      msg: `${req.method} method is not allowed for this endpoint`,
    }),
    { status: 405 }
  );
}

export async function DELETE(req: NextRequest) {
  return new NextResponse(
    JSON.stringify({
      msg: `${req.method} method is not allowed for this endpoint`,
    }),
    { status: 405 }
  );
}
