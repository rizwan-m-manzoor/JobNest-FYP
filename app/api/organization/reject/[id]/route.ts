import { NextRequest, NextResponse } from "next/server";
import {
  authorizeRoles,
  isAuthenticated,
} from "./../../../../../middlewares/auth";
import { orgStatusMsg } from "./../../../../../utils/mailMsg";
import Organization from "./../../../../../models/Organization";
import User from "./../../../../../models/User";
import sendEmail from "./../../../../../utils/sendMail";
import connectDB from "./../../../../../libs/db";

export const DELETE = async (req: NextRequest) => {
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

    const organizationId = req.url.split("/").pop();
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return new NextResponse(
        JSON.stringify({
          msg: `Organization with ID ${organizationId} not found.`,
        }),
        {
          status: 404,
        }
      );
    }

    const userId = organization.user;
    const findUser = await User.findById(userId);
    if (!findUser) {
      return new NextResponse(
        JSON.stringify({ msg: `User with ID ${userId} not found.` }),
        {
          status: 404,
        }
      );
    }

    await Organization.findByIdAndDelete(organizationId);
    await User.findByIdAndDelete(userId);

    const emailMsg = orgStatusMsg("reject");
    await sendEmail(findUser.email, "Organization Approval Status", emailMsg);

    return new NextResponse(
      JSON.stringify({
        msg: `Organization with ID ${organizationId} has been rejected successfully.`,
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
