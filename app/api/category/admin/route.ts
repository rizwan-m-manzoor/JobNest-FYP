import { NextRequest, NextResponse } from "next/server";
import {
  authorizeRoles,
  isAuthenticated,
} from "./../../../../middlewares/auth";
import connectDB from "./../../../../libs/db";
import Category from "./../../../../models/Category";

const Pagination = (req: NextRequest) => {
  const page = Number(req.nextUrl.searchParams.get("page")) || 1;
  const limit = Number(req.nextUrl.searchParams.get("limit")) || 6;
  const skip = (page - 1) * limit;
  return { page, skip, limit };
};

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await isAuthenticated(req);
    if (!user) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const isAuthorize = await authorizeRoles(user._id, "admin");
    if (!isAuthorize) {
      return new NextResponse(JSON.stringify({ message: "Forbidden" }), {
        status: 403,
      });
    }

    const { skip, limit } = Pagination(req);

    const categories = await Category.find()
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);
    const totalCategories = await Category.countDocuments();

    let totalPage = 0;
    if (categories.length === 0) {
      totalPage = 0;
    } else {
      if (totalCategories % limit === 0) {
        totalPage = totalCategories / limit;
      } else {
        totalPage = Math.floor(totalCategories / limit) + 1;
      }
    }

    return new NextResponse(JSON.stringify({ categories, totalPage }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
