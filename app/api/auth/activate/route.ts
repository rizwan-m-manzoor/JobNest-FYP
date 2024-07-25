import { NextRequest, NextResponse } from "next/server";
import { IRegister } from "./../../../../utils/Interface";
import jwt from "jsonwebtoken";
import connectDB from "./../../../../libs/db";
import User from "./../../../../models/User";
import Jobseeker from "./../../../../models/Jobseeker";
import Organization from "./../../../../models/Organization";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { token } = await req.json();
    if (!token) {
      return new NextResponse(
        JSON.stringify({ msg: "Please provide account activation token." }),
        { status: 400 }
      );
    }

    let decoded;
    try {
      const decodedToken = <IRegister>(
        jwt.verify(token, `${process.env.ACTIVATION_TOKEN_SECRET}`)
      );
      decoded = decodedToken;
    } catch (error) {
      console.error(error);
      return new NextResponse(
        JSON.stringify({ msg: "Invalid account activation token." }),
        { status: 401 }
      );
    }

    // const decoded = <IRegister>(
    //   jwt.verify(token, `${process.env.ACTIVATION_TOKEN_SECRET}`)
    // );
    if (!decoded) {
      return new NextResponse(
        JSON.stringify({ msg: "Invalid account activation token." }),
        { status: 401 }
      );
    }

    const findUser = await User.findOne({ email: decoded.email });
    if (findUser) {
      return new NextResponse(
        JSON.stringify({ msg: "Email has been registered before." }),
        { status: 400 }
      );
    }

    const newUser = new User({
      name: decoded.name,
      email: decoded.email,
      password: decoded.password,
      role: decoded.role,
      avatar:
        decoded.avatar ||
        "https://res.cloudinary.com/devatchannel/image/upload/v1602752402/avatar/avatar_cugq40.png",
      province: decoded.province || "",
      city: decoded.city || "",
      district: decoded.district || "",
      postalCode: decoded.postalCode || "",
    });

    await newUser.save();

    if (decoded.role === "jobseeker") {
      const newJobseeker = new Jobseeker({
        user: newUser._id,
      });

      await newJobseeker.save();
    } else {
      const newOrganization = new Organization({
        user: newUser._id,
        phoneNumber: decoded.phoneNumber,
        createdDate: decoded.createdDate,
        totalEmployee: decoded.totalEmployee,
        industryType: decoded.industryType,
        address: decoded.address,
        description: decoded.description,
      });

      await newOrganization.save();
    }

    let msg = "Account has been activated successfully.";
    if (decoded.role === "organization") {
      msg +=
        " Please wait for account to be verified by admin as an organization account.";
    }

    return new NextResponse(JSON.stringify({ msg: msg }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ msg: "Internal Server Error" }),
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return new NextResponse(
    JSON.stringify({
      msg: `${req.method} method is not allowed for this endpoint`,
    }),
    { status: 405 }
  );
}

export async function PATCH(req: NextRequest) {
  return new NextResponse(
    JSON.stringify({
      msg: `${req.method} method is not allowed for this endpoint`,
    }),
    { status: 405 }
  );
}

export async function DELETE(req: NextRequest) {
  return new NextResponse(
    JSON.stringify({
      msg: `${req.method} method is not allowed for this endpoint`,
    }),
    { status: 405 }
  );
}
