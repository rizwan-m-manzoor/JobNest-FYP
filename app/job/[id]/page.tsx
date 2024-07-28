import React from "react";
import { getJobData } from "./getJobData";
import JobDetail from "./JobDetail";
import Head from "next/head";
import Navbar from "../../../components/general/Navbar";
import Footer from "../../../components/general/Footer";

interface PageProps {
  params: { id: string };
}

const JobPage = async ({ params }: PageProps) => {
  const job = await getJobData(params.id);

  if (!job) {
    return (
      <>
        <Head>
          <title>Job Nest</title>
        </Head>
        <Navbar />
        <div className="md:px-52 px-6 py-10">
          <div className="bg-red-500 text-white text-center rounded-md py-3">
            No Job Data Found.
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return <JobDetail job={job} />;
};

export default JobPage;
