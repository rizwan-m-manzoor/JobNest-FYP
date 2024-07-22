import { NextRequest, NextResponse } from "next/server";
import { IDecodedToken } from "./../utils/Interface";
import jwt from "jsonwebtoken";
import User from "./../models/User";
import Organization from "./../models/Organization";
import Jobseeker from "./../models/Jobseeker";
import connectDB from "./../libs/db";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET) {
  throw new Error("Please define the ACCESS_TOKEN_SECRET environment variable");
}

export const isAuthenticated = async (req: NextRequest) => {
  try {
    await connectDB();
    const token = req.headers.get("authorization");
    if (!token) {
      return false;
    }

    const decoded = <IDecodedToken>jwt.verify(token, ACCESS_TOKEN_SECRET);
    if (!decoded.id) {
      return false;
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return false;
    }

    return user;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const authorizeRoles = async (userId: string, ...roles: string[]) => {
  try {
    await connectDB();
    const user = await User.findById(userId);
    if (!roles.includes(user.role)) {
      console.error({
        msg: `${user.role} role doesn't have access to this resource.`,
      });
      return false;
    }

    let userDetail;
    if (user.role === "organization") {
      userDetail = await Organization.findOne({ user: userId }).populate(
        "user"
      );
      return userDetail;
    } else if (user.role === "jobseeker") {
      userDetail = await Jobseeker.findOne({ user: userId }).populate("user");
      return userDetail;
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
