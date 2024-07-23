import { NextRequest, NextResponse } from "next/server";
import {
  authorizeRoles,
  isAuthenticated,
} from "./../../../../middlewares/auth";
import connectDB from "./../../../../libs/db";
import Invitation from "./../../../../models/Invitation";

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const user = await isAuthenticated(req);
    if (!user) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const isAuthorize = await authorizeRoles(user._id, "jobseeker");
    if (!isAuthorize) {
      return new NextResponse(JSON.stringify({ message: "Forbidden" }), {
        status: 403,
      });
    }

    const { status } = await req.json();
    if (!status) {
      return new NextResponse(
        JSON.stringify({
          message: "Please provide new status for the invitation.",
        }),
        { status: 400 }
      );
    }

    const invitationId = req.nextUrl.searchParams.get("id");
    if (!invitationId) {
      return new NextResponse(
        JSON.stringify({ message: "Invitation ID is required." }),
        { status: 400 }
      );
    }

    const findInvitation = await Invitation.findOne({ _id: invitationId });
    if (!findInvitation) {
      return new NextResponse(
        JSON.stringify({ message: "Invitation not found." }),
        { status: 404 }
      );
    }

    await Invitation.findOneAndUpdate({ _id: invitationId }, { status });

    return new NextResponse(
      JSON.stringify({
        message: `Invitation status has been ${status} successfully.`,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
