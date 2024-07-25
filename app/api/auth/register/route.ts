import { NextRequest, NextResponse } from "next/server";
import { validateEmail } from "./../../../../utils/validator";
import { generateActivationToken } from "./../../../../utils/generateToken";
import { authMsg } from "./../../../../utils/mailMsg";
import bcrypt from "bcrypt";
import User from "./../../../../models/User";
import sendEmail from "./../../../../utils/sendMail";
import connectDB from "./../../../../libs/db";

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();

    const {
      name,
      email,
      password,
      avatar,
      province,
      city,
      district,
      postalCode,
      role,
      phoneNumber,
      createdDate,
      totalEmployee,
      industryType,
      address,
      description,
    } = await req.json();

    if (role === "jobseeker") {
      if (!name || !email || !password)
        return new NextResponse(
          JSON.stringify({
            msg: "Please provide name, email, and password for register.",
          }),
          { status: 400 }
        );

      if (!validateEmail(email))
        return new NextResponse(
          JSON.stringify({ msg: "Please provide valid email address." }),
          { status: 400 }
        );

      if (password.length < 8)
        return new NextResponse(
          JSON.stringify({ msg: "Password should be at least 8 characters." }),
          { status: 400 }
        );

      const findUser = await User.findOne({ email });
      if (findUser)
        return new NextResponse(
          JSON.stringify({ msg: `${email} email has been registered before.` }),
          { status: 400 }
        );

      const passwordHash = await bcrypt.hash(password, 12);

      const user = {
        name,
        email,
        password: passwordHash,
        role: "jobseeker",
      };

      const token = generateActivationToken(user);
      const url = `${process.env.CLIENT_URL}/activate/${token}`;

      sendEmail(email, "Account Activation", url);

      return new NextResponse(
        JSON.stringify({
          msg: `An account activation link has been sent to ${email}`,
        }),
        { status: 200 }
      );
    } else if (role === "organization") {
      if (
        !name ||
        !email ||
        !password ||
        !avatar ||
        !province ||
        !city ||
        !district ||
        !postalCode ||
        !phoneNumber ||
        !createdDate ||
        !industryType ||
        !address ||
        !description
      )
        return new NextResponse(
          JSON.stringify({
            msg: "Please provide every field in form to register.",
          }),
          { status: 400 }
        );

      if (!validateEmail(email))
        return new NextResponse(
          JSON.stringify({ msg: "Please provide valid email address." }),
          { status: 400 }
        );

      if (password.length < 8)
        return new NextResponse(
          JSON.stringify({ msg: "Password should be at least 8 characters." }),
          { status: 400 }
        );

      if (phoneNumber.length < 8)
        return new NextResponse(
          JSON.stringify({ msg: "Please provide valid phone number" }),
          { status: 400 }
        );

      if (new Date(createdDate).toISOString() > new Date().toISOString())
        return new NextResponse(
          JSON.stringify({
            msg: "Organization created date can't be greater than current date.",
          }),
          { status: 400 }
        );

      if (totalEmployee < 1)
        return new NextResponse(
          JSON.stringify({
            msg: "Organization estimated total employee should be more than 0.",
          }),
          { status: 400 }
        );

      if (description.length < 100)
        return new NextResponse(
          JSON.stringify({
            msg: "Organization description should be at least 100 characters.",
          }),
          { status: 400 }
        );

      const findUser = await User.findOne({ email });
      if (findUser)
        return new NextResponse(
          JSON.stringify({ msg: `Email ${email} has been registered before.` }),
          { status: 400 }
        );

      const passwordHash = await bcrypt.hash(password, 12);

      const user = {
        name,
        email,
        password: passwordHash,
        avatar,
        province,
        city,
        district,
        postalCode,
        phoneNumber,
        createdDate,
        totalEmployee,
        industryType,
        address,
        description,
        role: "organization",
      };

      const token = generateActivationToken(user);

      const url = `${process.env.CLIENT_URL}/activate/${token}`;
      const emailMsg = authMsg("Account Activation", url);

      sendEmail(email, "Account Activation", emailMsg);

      return new NextResponse(
        JSON.stringify({
          msg: `An account activation link has been sent to ${email}`,
        }),
        { status: 200 }
      );
    } else {
      return new NextResponse(
        JSON.stringify({ msg: `${role} role does not exist.` }),
        { status: 400 }
      );
    }
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ msg: "Internal Server Error" }),
      { status: 500 }
    );
  }
};
