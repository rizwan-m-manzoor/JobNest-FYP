import { NextRequest, NextResponse } from "next/server";
import { authorizeRoles, isAuthenticated } from "./../../../middlewares/auth";
import Job from "./../../../models/Job";
import connectDB from "./../../../libs/db";

const Pagination = (req: NextRequest) => {
  const page = Number(req.nextUrl.searchParams.get("page")) || 1;
  const limit = Number(req.nextUrl.searchParams.get("limit")) || 6;
  const skip = (page - 1) * limit;
  return { page, skip, limit };
};

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

    const isAuthorize = await authorizeRoles(user._id, "organization");
    if (!isAuthorize) {
      return new NextResponse(JSON.stringify({ msg: "Forbidden" }), {
        status: 403,
      });
    }

    if (isAuthorize.status !== "accepted") {
      return new NextResponse(
        JSON.stringify({
          msg: "Your organization hasn't been accepted yet by admin.",
        }),
        {
          status: 401,
        }
      );
    }

    const {
      position,
      employmentType,
      jobLevel,
      category,
      skills,
      salary,
      overview,
      requirements,
      keywords,
    } = await req.json();

    if (
      !position ||
      !employmentType ||
      !category ||
      !jobLevel ||
      skills.length < 1 ||
      salary < 1 ||
      !overview ||
      !requirements ||
      keywords.length < 1
    ) {
      return new NextResponse(
        JSON.stringify({
          msg: "Please provide every field in form to create job.",
        }),
        {
          status: 400,
        }
      );
    }

    if (overview.length < 100) {
      return new NextResponse(
        JSON.stringify({
          msg: "Job overview should be at least 100 characters.",
        }),
        {
          status: 400,
        }
      );
    }

    const newJob = new Job({
      organization: isAuthorize._id,
      position,
      jobLevel,
      employmentType,
      category,
      skills,
      salary,
      overview,
      requirements,
      keywords,
    });

    await newJob.save();

    return new NextResponse(
      JSON.stringify({
        msg: "Job has been created successfully.",
        job: newJob,
      }),
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

    const isAuthorize = await authorizeRoles(user._id, "organization");
    if (!isAuthorize) {
      return new NextResponse(JSON.stringify({ msg: "Forbidden" }), {
        status: 403,
      });
    }

    const { skip, limit } = Pagination(req);

    const data = await Job.aggregate([
      {
        $facet: {
          totalData: [
            { $match: { organization: isAuthorize._id } },
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
                        {
                          $project: {
                            name: 1,
                            avatar: 1,
                            province: 1,
                            city: 1,
                            district: 1,
                            postalCode: 1,
                          },
                        },
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
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
          ],
          totalCount: [
            { $match: { organization: isAuthorize._id } },
            { $count: "count" },
          ],
        },
      },
      {
        $project: {
          totalData: 1,
          count: { $arrayElemAt: ["$totalCount.count", 0] },
        },
      },
    ]);

    const jobs = data[0].totalData;
    const jobsCount = data[0].count;
    let totalPage = 0;

    if (jobs.length === 0) totalPage = 0;
    else {
      totalPage = Math.ceil(jobsCount / limit);
    }

    return new NextResponse(JSON.stringify({ jobs, totalPage }), {
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
      Allow: "GET, POST, OPTIONS",
    },
  });
};
