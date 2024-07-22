import { NextRequest, NextResponse } from "next/server";
import { authorizeRoles, isAuthenticated } from "./../../../middlewares/auth";
import Jobseeker from "./../../../models/Jobseeker";
import User from "./../../../models/User";
import connectDB from "./../../../libs/db";

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();

    const jobAggregate: any[] = [
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
    ];

    const queryParam = req.nextUrl.searchParams.get("q");
    if (queryParam) {
      const searchAggregate = {
        $search: {
          index: "jobseeker",
          text: {
            path: "skills",
            query: queryParam,
          },
        },
      };

      jobAggregate.unshift(searchAggregate);
    }

    const jobseekers = await Jobseeker.aggregate(jobAggregate);

    return new NextResponse(JSON.stringify({ jobseekers }), {
      status: 200,
    });
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

    const body = await req.json();
    const {
      avatar,
      name,
      dob,
      cv,
      province,
      city,
      district,
      postalCode,
      skills,
      about,
    } = body;
    if (!name) {
      return new NextResponse(
        JSON.stringify({ msg: "Please provide your name." }),
        {
          status: 400,
        }
      );
    }

    if (dob && new Date(dob).toISOString() > new Date().toISOString()) {
      return new NextResponse(
        JSON.stringify({
          msg: "Date of birth can't be greater than current date.",
        }),
        {
          status: 400,
        }
      );
    }

    const jobseekerId = isAuthorize._id;

    const newUser = await User.findOneAndUpdate(
      { _id: user._id },
      { name, avatar, province, city, district, postalCode },
      { new: true }
    );

    await Jobseeker.findOneAndUpdate(
      { _id: jobseekerId },
      { dob, cv, skills, about }
    );

    return new NextResponse(
      JSON.stringify({
        msg: "Profile has been updated successfully.",
        user: newUser,
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

export const OPTIONS = () => {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "GET, PATCH, OPTIONS",
    },
  });
};
