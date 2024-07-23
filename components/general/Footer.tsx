import Image from "next/image";
import Link from "next/link";
import Logo from "./../../public/images/logo.png";

const Footer = () => {
  return (
    <div className="flex md:flex-row flex-col md:gap-3 gap-12 md:px-20 px-8 py-8 bg-[#282773] text-white">
      <div className="flex-1">
        <div className="flex items-center mb-2">
          <Image src={Logo} width={60} height={60} alt="Job Nest" />
          <h1>Job Nest</h1>
        </div>
        <p className="mb-3">
          We transform the way candidates find jobs and companies hire talent.
        </p>
        <p>&copy; {new Date().getFullYear()} Job Nest, Inc.</p>
      </div>
      <div className="flex flex-col gap-2 flex-1 md:px-40">
        <Link href="/" className="outline-0">
          About
        </Link>
        <Link href="/" className="outline-0">
          Careers
        </Link>
        <Link href="/" className="outline-0">
          Internships
        </Link>
        <Link href="/" className="outline-0">
          Press
        </Link>
        <Link href="/" className="outline-0">
          Blog
        </Link>
        <Link href="/" className="outline-0">
          Contact
        </Link>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        <h1 className="font-bold text-gray-400">CANDIDATE</h1>
        <Link href="/" className="outline-0">
          Job Board
        </Link>
        <Link href="/" className="outline-0">
          Career Advice
        </Link>
        <Link href="/" className="outline-0">
          Help for Jobseekers
        </Link>
        <Link href="/" className="outline-0">
          Jobseeker Guide
        </Link>
      </div>
    </div>
  );
};

export default Footer;
