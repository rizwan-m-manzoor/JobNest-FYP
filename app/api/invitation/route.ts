import { NextRequest, NextResponse } from "next/server";
import {
  authorizeRoles,
  isAuthenticated,
} from "./../../../middlewares/auth";
import Invitation from "./../../../models/Invitation";
import connectDB from "./../../../libs/db";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

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

    const { jobId, userId } = await req.json();
    if (!jobId || !userId) {
      return new NextResponse(
        JSON.stringify({ msg: "Please provide job and user ID." }),
        { status: 400 }
      );
    }

    const newInvitation = new Invitation({ job: jobId, user: userId });
    await newInvitation.save();

    return new NextResponse(
      JSON.stringify({
        msg: "Invitation sent.",
        invitation: newInvitation,
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

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = await isAuthenticated(request);
    if (!user) {
      return new NextResponse(JSON.stringify({ msg: "Unauthorized" }), {
        status: 401,
      });
    }

    const isAuthorize = await authorizeRoles(
      user._id,
      "organization",
      "jobseeker",
    );
    if (!isAuthorize) {
      return new NextResponse(JSON.stringify({ msg: "Forbidden" }), {
        status: 403,
      });
    }

    const userRole = user.role;

    if (userRole === "jobseeker") {
      const invitations = await Invitation.aggregate([
        { $match: { user: user._id } },
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
            ],
            as: "job",
          },
        },
        { $unwind: "$job" },
      ]);

      return new NextResponse(JSON.stringify({ invitations }), { status: 200 });
    } else if (userRole === "organization") {
      const invitations = await Invitation.find().populate("job");
      return new NextResponse(JSON.stringify({ invitations }), { status: 200 });
    } else {
      return new NextResponse(
        JSON.stringify({ msg: "Invalid user role" }),
        { status: 403 }
      );
    }
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ msg: "Internal Server Error" }),
      { status: 500 }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204 });
}
