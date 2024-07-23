import { NextRequest, NextResponse } from "next/server";
import {
  authorizeRoles,
  isAuthenticated,
} from "./../../../middlewares/auth";
import Category from "./../../../models/Category";
import connectDB from "./../../../libs/db";

export async function POST(req: NextRequest) {
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

    const { name, image } = await req.json();
    if (!name || !image) {
      return new NextResponse(
        JSON.stringify({ message: "Please provide category name and image." }),
        { status: 400 }
      );
    }

    const findCategory = await Category.findOne({ name });
    if (findCategory) {
      return new NextResponse(
        JSON.stringify({ message: `${name} category already exists.` }),
        { status: 400 }
      );
    }

    const newCategory = new Category({ name, image });
    await newCategory.save();

    return new NextResponse(
      JSON.stringify({
        message: `${name} category has been created successfully.`,
        category: newCategory,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
