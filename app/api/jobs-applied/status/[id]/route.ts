import { NextRequest, NextResponse } from "next/server";
import {
  authorizeRoles,
  isAuthenticated,
} from "./../../../../../middlewares/auth";
import connectDB from "./../../../../../libs/db";
import Job from "./../../../../../models/Job";
import JobsApplied from "./../../../../../models/JobsApplied";

export const PATCH = async (req: NextRequest) => {
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

    const isAuthorize = await authorizeRoles(user._id, "organization");
    if (!isAuthorize) {
      return new NextResponse(JSON.stringify({ msg: "Forbidden" }), {
        status: 403,
      });
    }

    const { job, status } = await req.json();

    const findJob = await Job.findOne({
      _id: job,
      organization: isAuthorize._id,
    });

    if (!findJob) {
      return new NextResponse(
        JSON.stringify({ msg: "Job not found within your organization." }),
        {
          status: 404,
        }
      );
    }

    await JobsApplied.findOneAndUpdate(
      { jobseeker: req.url.split("/").pop(), job },
      { status }
    );

    return new NextResponse(
      JSON.stringify({ msg: `Status has been changed to ${status}` }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ msg: "Internal Server Error" }), {
      status: 500,
    });
  }
};

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

    const isAuthorize = await authorizeRoles(user._id, "jobseeker");
    if (!isAuthorize) {
      return new NextResponse(JSON.stringify({ msg: "Forbidden" }), {
        status: 403,
      });
    }

    const isApplied = await JobsApplied.findOne({
      jobseeker: isAuthorize._id,
      job: req.url.split("/").pop(),
    });

    return new NextResponse(JSON.stringify({ isApplied: !!isApplied }), {
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
      Allow: "GET, PATCH, OPTIONS",
    },
  });
};
