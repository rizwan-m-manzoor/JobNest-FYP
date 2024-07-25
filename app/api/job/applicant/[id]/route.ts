import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "./../../../../../libs/db";
import JobsApplied from "./../../../../../models/JobsApplied";
import Job from "./../../../../../models/Job";
import {
  authorizeRoles,
  isAuthenticated,
} from "./../../../../../middlewares/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const id = req.url.split('/').pop();

    const user = await isAuthenticated(req);
    if (!user) {
      return new NextResponse(JSON.stringify({ msg: "Unauthorized" }), {
        status: 401,
      });
    }

    const isAuthorize = await authorizeRoles(user._id, "organization");
    if (!isAuthorize) {
      return new NextResponse(JSON.stringify({ msg: "Forbidden" }), {
        status: 403,
      });
    }

    const findJob = await Job.findOne({
      organization: isAuthorize._id,
      _id: id,
    });
    if (!findJob) {
      return new NextResponse(
        JSON.stringify({
          msg: `Job with ID ${id} not found within this organization`,
        }),
        { status: 404 }
      );
    }

    const applicants = await JobsApplied.aggregate([
      { $match: { job: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "jobseekers",
          let: { jobseeker_id: "$jobseeker" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$jobseeker_id"] } } },
            {
              $lookup: {
                from: "users",
                let: { user_id: "$user" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$user_id"] } } },
                  {
                    $project: { name: 1, avatar: 1, createdAt: 1, province: 1 },
                  },
                ],
                as: "user",
              },
            },
            { $unwind: "$user" },
          ],
          as: "jobseeker",
        },
      },
      { $unwind: "$jobseeker" },
    ]);

    return new NextResponse(JSON.stringify({ applicants }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ msg: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
