import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "./../../../../libs/db";
import Job from "./../../../../models/Job";
import {
  authorizeRoles,
  isAuthenticated,
} from "./../../../../middlewares/auth";

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    const id = req.url.split('/').pop();

    const job = await Job.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
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
    ]);

    if (job.length === 0) {
      return new NextResponse(
        JSON.stringify({ msg: `Job with ID ${id} not found.` }),
        { status: 404 }
      );
    }

    return new NextResponse(JSON.stringify({ job }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ msg: "Internal Server Error" }), {
      status: 500,
    });
  }
};

export const DELETE = async (req: NextRequest) => {
  try {
    await connectDB();
    const id = req.url.split('/').pop();

    const user = await isAuthenticated(req);
    if (!user) return new NextResponse(null, { status: 401 });

    const isAuthorize = await authorizeRoles(user._id, "organization");
    if (!isAuthorize) return new NextResponse(null, { status: 403 });

    const deletedJob = await Job.findOneAndDelete({ _id: id });
    if (!deletedJob) {
      return new NextResponse(
        JSON.stringify({ msg: `Job with ID ${id} not found.` }),
        { status: 404 }
      );
    }

    return new NextResponse(
      JSON.stringify({ msg: "Job has been deleted successfully." }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ msg: "Internal Server Error" }), {
      status: 500,
    });
  }
};

export const PATCH = async (req: NextRequest) => {
  try {
    await connectDB();
    const id = req.url.split('/').pop();
    const body = await req.json();

    const user = await isAuthenticated(req);
    if (!user) return new NextResponse(null, { status: 401 });

    const isAuthorize = await authorizeRoles(user._id, "organization");
    if (!isAuthorize) return new NextResponse(null, { status: 403 });

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
    } = body;

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
          msg: "Please provide every field in form to update job.",
        }),
        { status: 400 }
      );
    }

    if (overview.length < 100) {
      return new NextResponse(
        JSON.stringify({
          msg: "Job overview should be at least 100 characters.",
        }),
        { status: 400 }
      );
    }

    const updatedJob = await Job.findOneAndUpdate(
      { _id: id, organization: isAuthorize._id },
      {
        position,
        jobLevel,
        employmentType,
        category,
        skills,
        salary,
        overview,
        requirements,
        keywords,
      },
      { new: true }
    );

    if (!updatedJob) {
      return new NextResponse(
        JSON.stringify({
          msg: `Job with ID ${id} not found within your organization.`,
        }),
        { status: 404 }
      );
    }

    return new NextResponse(
      JSON.stringify({
        msg: "Job has been updated successfully.",
        job: updatedJob,
      }),
      { status: 200 }
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
      Allow: "GET, DELETE, PATCH, OPTIONS",
    },
  });
};
