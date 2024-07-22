import { NextRequest, NextResponse } from "next/server";
import {
  authorizeRoles,
  isAuthenticated,
} from "./../../../../middlewares/auth";
import connectDB from "./../../../../libs/db";
import Organization from "./../../../../models/Organization";

const Pagination = (req: NextRequest) => {
  const page = Number(req.nextUrl.searchParams.get("page")) || 1;
  const limit = Number(req.nextUrl.searchParams.get("limit")) || 6;
  const skip = (page - 1) * limit;
  return { page, skip, limit };
};

export const GET = async (req: NextRequest) => {
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

    const unapprovedOrganization = await Organization.find({
      status: { $ne: "accepted" },
    })
      .populate("user")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);

    const totalOrganizations = await Organization.countDocuments();
    let totalPage = 0;

    if (unapprovedOrganization.length === 0) {
      totalPage = 0;
    } else {
      if (totalOrganizations % limit === 0) {
        totalPage = totalOrganizations / limit;
      } else {
        totalPage = Math.floor(totalOrganizations / limit) + 1;
      }
    }

    return new NextResponse(
      JSON.stringify({ organizations: unapprovedOrganization, totalPage }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error" }),
      {
        status: 500,
      }
    );
  }
};
