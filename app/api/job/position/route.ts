import { NextRequest, NextResponse } from "next/server";
import { authorizeRoles, isAuthenticated } from "../../../../middlewares/auth";
import connectDB from "../../../../libs/db";
import Job from "../../../../models/Job";

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

    const position = await Job.aggregate([
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
    ]);

    return new NextResponse(JSON.stringify({ position }), {
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
