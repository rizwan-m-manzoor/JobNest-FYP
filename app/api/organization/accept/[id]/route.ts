import { NextRequest, NextResponse } from "next/server";
import {
  authorizeRoles,
  isAuthenticated,
} from "../../../../../middlewares/auth";
import { orgStatusMsg } from "./../../../../../utils/mailMsg";
import Organization from "./../../../../../models/Organization";
import connectDB from "./../../../../../libs/db";
import sendEmail from "./../../../../../utils/sendMail";

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

    const isAuthorize = await authorizeRoles(user._id, "admin");
    if (!isAuthorize) {
      return new NextResponse(JSON.stringify({ msg: "Forbidden" }), {
        status: 403,
      });
    }

    const organizationId = req.nextUrl.searchParams.get("id");
    const findOrganization = await Organization.findById(
      organizationId
    ).populate("user");
    if (!findOrganization) {
      return new NextResponse(
        JSON.stringify({
          msg: `Organization with ID ${organizationId} not found.`,
        }),
        {
          status: 404,
        }
      );
    }

    if (findOrganization.status === "accepted") {
      return new NextResponse(
        JSON.stringify({ msg: "Organization has been accepted before." }),
        {
          status: 400,
        }
      );
    }

    await Organization.findOneAndUpdate(
      { _id: organizationId },
      { status: "accepted" }
    );

    const emailMsg = orgStatusMsg("accept");
    await sendEmail(
      findOrganization.user.email,
      "Organization Approval Status",
      emailMsg
    );

    return new NextResponse(
      JSON.stringify({
        msg: `Organization with ID ${organizationId} has been accepted successfully.`,
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
