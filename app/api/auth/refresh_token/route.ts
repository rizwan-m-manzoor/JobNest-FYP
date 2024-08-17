import { NextRequest, NextResponse } from "next/server";
import { IDecodedToken } from "./../../../../utils/Interface";
import { generateAccessToken } from "./../../../../utils/generateToken";
import jwt from "jsonwebtoken";
import User from "./../../../../models/User";
import connectDB from "./../../../../libs/db";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = req.cookies.get("jobnest_rfToken")?.value;
    if (!token) {
      return new NextResponse(
        JSON.stringify({
          msg: "Invalid authentication.",
        }),
        { status: 400 }
      );
    }

    const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

    if (!REFRESH_TOKEN_SECRET) {
      throw new Error(
        "Please define the REFRESH_TOKEN_SECRET environment variable"
      );
    }

    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as IDecodedToken;
    if (!decoded.id) {
      return new NextResponse(
        JSON.stringify({
          msg: "Invalid authentication.",
        }),
        { status: 401 }
      );
    }

    const user = await User.findById(decoded.id);
    const accessToken = generateAccessToken({ id: user._id });

    return new NextResponse(
      JSON.stringify({
        accessToken,
        user: {
          ...user._doc,
          password: "",
        },
      }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error(err);
    return new NextResponse(
      JSON.stringify({
        msg: err.message,
      }),
      { status: 500 }
    );
  }
}
