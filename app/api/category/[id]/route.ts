import { NextRequest, NextResponse } from "next/server";
import { authorizeRoles, isAuthenticated } from "../../../../middlewares/auth";
import connectDB from "../../../../libs/db";
import Category from "../../../../models/Category";

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const user = await isAuthenticated(req);
    if (!user) {
      return new NextResponse(JSON.stringify({ msg: "Unauthorized" }), {
        status: 401,
      });
    }

    const isAuthorize = await authorizeRoles(user._id, "admin");
    if (!isAuthorize) {
      return new NextResponse(JSON.stringify({ msg: "Forbidden" }), {
        status: 403,
      });
    }

    const categoryId = req.url.split("/").pop();
    const findCategory = await Category.findById(categoryId);
    if (!findCategory) {
      return new NextResponse(
        JSON.stringify({
          msg: `Category with ID ${categoryId} not found.`,
        }),
        { status: 404 }
      );
    }

    const { name, image } = await req.json();
    if (!name || !image) {
      return new NextResponse(
        JSON.stringify({ msg: "Please provide category name and image." }),
        { status: 400 }
      );
    }

    const updatedCategory = await Category.findOneAndUpdate(
      { _id: categoryId },
      { name, image },
      { new: true }
    );

    return new NextResponse(
      JSON.stringify({
        msg: "Category has been updated successfully.",
        category: updatedCategory,
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

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const user = await isAuthenticated(req);
    if (!user) {
      return new NextResponse(JSON.stringify({ msg: "Unauthorized" }), {
        status: 401,
      });
    }

    const isAuthorize = await authorizeRoles(user._id, "admin");
    if (!isAuthorize) {
      return new NextResponse(JSON.stringify({ msg: "Forbidden" }), {
        status: 403,
      });
    }

    const categoryId = req.url.split("/").pop();
    const findCategory = await Category.findById(categoryId);
    if (!findCategory) {
      return new NextResponse(
        JSON.stringify({
          msg: `Category with ID ${categoryId} not found.`,
        }),
        { status: 404 }
      );
    }

    await Category.findOneAndDelete({ _id: categoryId });
    return new NextResponse(
      JSON.stringify({ msg: "Category has been deleted successfully." }),
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

export async function POST(req: NextRequest) {
  return new NextResponse(
    JSON.stringify({
      msg: `${req.method} method is not allowed for this endpoint`,
    }),
    { status: 405 }
  );
}
