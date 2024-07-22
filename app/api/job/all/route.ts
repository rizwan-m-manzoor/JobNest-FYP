import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../libs/db";
import Job from "../../../../models/Job";

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;

    const searchQuery = searchParams.get("q");
    const jobLevelQuery: string[] = [];
    const employmentTypeQuery: string[] = [];

    const jobAggregate: any[] = [
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
    ];

    const jobLevels = searchParams.getAll("jobLevel");
    if (jobLevels.length > 0) {
      jobLevelQuery.push(...jobLevels);
    }

    const employmentTypes = searchParams.getAll("employmentType");
    if (employmentTypes.length > 0) {
      employmentTypeQuery.push(...employmentTypes);
    }

    const salary = searchParams.get("salary");
    if (salary) {
      jobAggregate.unshift({
        $match: { salary: { $gte: parseInt(salary, 10) } },
      });
    }

    if (jobLevelQuery.length > 0) {
      jobAggregate.unshift({
        $match: { jobLevel: { $in: jobLevelQuery } },
      });
    }

    if (employmentTypeQuery.length > 0) {
      jobAggregate.unshift({
        $match: { employmentType: { $in: employmentTypeQuery } },
      });
    }

    if (searchQuery) {
      const searchAggregate = {
        $search: {
          index: "job",
          text: {
            path: ["position", "skills", "keywords"],
            query: searchQuery,
          },
        },
      };

      jobAggregate.unshift(searchAggregate);
    }

    const jobs = await Job.aggregate(jobAggregate);
    return new NextResponse(JSON.stringify({ jobs }), { status: 200 });
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
