import { NextRequest, NextResponse } from "next/server";
import { authorizeRoles, isAuthenticated } from "../../../../middlewares/auth";
import connectDB from "../../../../libs/db";
import Job from "../../../../models/Job";
import Jobseeker from "../../../../models/Jobseeker";
import JobsApplied from "../../../../models/JobsApplied";

export const POST = async (req: NextRequest) => {
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

    const { job, userId } = await req.json();
    if (!job || !userId) {
      return new NextResponse(
        JSON.stringify({ msg: "Please specify job and user data." }),
        {
          status: 400,
        }
      );
    }

    const findJob = await Job.findById(job);
    if (!findJob) {
      return new NextResponse(
        JSON.stringify({ msg: `Job with ID ${job} not found.` }),
        {
          status: 404,
        }
      );
    }

    const findJobseeker = await Jobseeker.findOne({ user: userId });
    if (!findJobseeker) {
      return new NextResponse(
        JSON.stringify({ msg: `Jobseeker with user ID ${userId} not found.` }),
        {
          status: 404,
        }
      );
    }

    const isAppliedBefore = await JobsApplied.findOne({
      job,
      jobseeker: findJobseeker._id,
      status: { $ne: "rejected" },
    });
    if (isAppliedBefore) {
      return new NextResponse(
        JSON.stringify({ msg: "Job has been applied before." }),
        {
          status: 400,
        }
      );
    }

    const newJobsApplied = new JobsApplied({
      job,
      jobseeker: findJobseeker._id,
    });
    await newJobsApplied.save();

    return new NextResponse(
      JSON.stringify({ msg: "Job applied successfully." }),
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

export const OPTIONS = () => {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
    },
  });
};
