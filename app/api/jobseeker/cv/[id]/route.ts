import { NextRequest, NextResponse } from "next/server";
import {
  authorizeRoles,
  isAuthenticated,
} from "./../../../../../middlewares/auth";
import connectDB from "./../../../../../libs/db";
import Jobseeker from "./../../../../../models/Jobseeker";

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();

    const user = await isAuthenticated(req);
    if (!user) {
      return new NextResponse(
        JSON.stringify({ msg: "Invalid authentication." }),
        {
          status: 401,
        }
      );
    }

    const isAuthorize = await authorizeRoles(user._id, "organization", "admin");
    if (!isAuthorize) {
      return new NextResponse(JSON.stringify({ msg: "Forbidden" }), {
        status: 403,
      });
    }

    const jobseekerId = req.url.split("/").pop();
    const jobseeker = await Jobseeker.findOne({ _id: jobseekerId }).populate(
      "user",
      "name"
    );
    if (!jobseeker) {
      return new NextResponse(JSON.stringify({ msg: "Jobseeker not found." }), {
        status: 404,
      });
    }

    return new NextResponse(JSON.stringify({ jobseeker }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ msg: "Internal Server Error" }), {
      status: 500,
    });
  }
};

export const OPTIONS = () => {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "GET, OPTIONS",
    },
  });
};
