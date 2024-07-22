import { NextRequest, NextResponse } from "next/server";
import { authorizeRoles, isAuthenticated } from "./../../../middlewares/auth";
import connectDB from "./../../../libs/db";
import JobApplied from "./../../../models/JobsApplied";
import Jobseeker from "./../../../models/Jobseeker";

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

    const findJobseeker = await Jobseeker.findOne({ user: user._id });
    if (!findJobseeker) {
      return new NextResponse(JSON.stringify({ msg: "Jobseeker not found." }), {
        status: 404,
      });
    }

    const jobs = await JobApplied.aggregate([
      { $match: { jobseeker: findJobseeker._id } },
      {
        $lookup: {
          from: "jobs",
          let: { job_id: "$job" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$job_id"] } } },
            {
              $lookup: {
                from: "organizations",
                let: { org_id: "$organization" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$org_id"] } } },
                  {
                    $lookup: {
                      from: "users",
                      let: { user_id: "$user" },
                      pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$user_id"] } } },
                      ],
                      as: "user",
                    },
                  },
                  { $unwind: "$user" },
                ],
                as: "organization",
              },
            },
            { $unwind: "$organization" },
          ],
          as: "job",
        },
      },
      { $unwind: "$job" },
    ]);

    return new NextResponse(JSON.stringify({ jobs }), {
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
