import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "./../../../../models/User";
import connectDB from "./../../../../libs/db";

export const PATCH = async (req: NextRequest) => {
  try {
    await connectDB();

    const { token, password } = await req.json();

    if (!token)
      return new NextResponse(
        JSON.stringify({ msg: "Invalid reset password token." }),
        { status: 400 }
      );

    if (!password)
      return new NextResponse(
        JSON.stringify({ msg: "Please provide new password." }),
        { status: 400 }
      );

    if (password.length < 8)
      return new NextResponse(
        JSON.stringify({ msg: "Password should be at least 8 characters." }),
        { status: 400 }
      );

    const decoded = <{ email: string }>(
      jwt.verify(token, `${process.env.ACCESS_TOKEN_SECRET}`)
    );
    if (!decoded.email)
      return new NextResponse(
        JSON.stringify({ msg: "Invalid reset password token." }),
        { status: 400 }
      );

    const findUser = await User.findOne({ email: decoded.email });
    if (!findUser)
      return new NextResponse(JSON.stringify({ msg: "User not found." }), {
        status: 404,
      });

    const passwordHash = await bcrypt.hash(password, 12);

    await User.findOneAndUpdate(
      { email: decoded.email },
      { password: passwordHash }
    );

    return new NextResponse(
      JSON.stringify({ msg: "Password has been reset successfully." }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ msg: "Internal Server Error" }),
      { status: 500 }
    );
  }
};
