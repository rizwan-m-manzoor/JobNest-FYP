import { NextRequest, NextResponse } from "next/server";
import Job from "./../../../models/Job";
import connectDB from "./../../../libs/db";

export const GET = async () => {
  try {
    await connectDB();

    const latestJob = await Job.aggregate([
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
      { $sort: { createdAt: -1 } },
      { $limit: 8 },
    ]);

    const categoryDisplay = await Job.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category._id",
          name: { $first: "$category.name" },
          image: { $first: "$category.image" },
          count: { $sum: 1 },
        },
      },
      { $project: { count: 1, image: 1, name: 1 } },
      { $limit: 8 },
    ]);

    return new NextResponse(JSON.stringify({ latestJob, categoryDisplay }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ msg: "Internal Server Error" }),
      {
        status: 500,
      }
    );
  }
};
