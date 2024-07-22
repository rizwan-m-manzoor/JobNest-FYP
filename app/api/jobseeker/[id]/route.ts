import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "./../../../../middlewares/auth";
import connectDB from "./../../../../libs/db";
import Jobseeker from "./../../../../models/Jobseeker";

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

    const jobseekerId = req.url.split("/").pop();
    const jobseeker = await Jobseeker.findOne({ user: jobseekerId }).populate(
      "user"
    );
    if (!jobseeker) {
      return new NextResponse(
        JSON.stringify({
          msg: `Jobseeker with user ID ${jobseekerId} not found.`,
        }),
        {
          status: 404,
        }
      );
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
