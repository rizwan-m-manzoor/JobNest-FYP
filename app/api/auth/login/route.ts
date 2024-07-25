import { NextRequest, NextResponse } from "next/server";
import { validateEmail } from "./../../../../utils/validator";
import {
  generateAccessToken,
  generateRefreshToken,
} from "./../../../../utils/generateToken";
import bcrypt from "bcrypt";
import User from "./../../../../models/User";
import connectDB from "./../../../../libs/db";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await req.json();
    if (!email || !password) {
      return new NextResponse(
        JSON.stringify({
          msg: "Please provide email and password to login.",
        }),
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return new NextResponse(
        JSON.stringify({ msg: "Please provide valid email address." }),
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return new NextResponse(
        JSON.stringify({ msg: "Invalid credential." }),
        { status: 401 }
      );
    }

    const isPassMatch = await bcrypt.compare(password, user.password);
    if (!isPassMatch) {
      return new NextResponse(
        JSON.stringify({ msg: "Invalid credential." }),
        { status: 401 }
      );
    }

    const accessToken = generateAccessToken({ id: user._id });
    const refreshToken = generateRefreshToken({ id: user._id });

    return new NextResponse(
      JSON.stringify({
        msg: `Authorized as ${user.name}`,
        accessToken,
        refreshToken,
        user: {
          ...user._doc,
          password: "",
        },
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
