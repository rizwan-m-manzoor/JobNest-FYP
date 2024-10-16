"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AiOutlineSearch } from "react-icons/ai";
import { FormSubmit, IJob } from "../../utils/Interface";
import Head from "next/head";
import Footer from "../../components/general/Footer";
import Navbar from "../../components/general/Navbar";
import Filter from "../../components/jobs/Filter";
import JobCard from "../../components/jobs/JobCard";

interface IProps {
  data: IJob[];
  searchParams: any;
}

const JobsClient = ({ data, searchParams }: IProps) => {
  const [search, setSearch] = useState(searchParams.q || "");
  const [selectedJobLevel, setSelectedJobLevel] = useState<string[]>(
    searchParams.jobLevel || []
  );
  const [selectedEmploymentType, setSelectedEmploymentType] = useState<
    string[]
  >(searchParams.employmentType || []);
  const [minSalary, setMinSalary] = useState(searchParams.salary || 0);

  const router = useRouter();
  const [jobs, setJobs] = useState<IJob[]>(data);

  const handleFilter = (e?: FormSubmit) => {
    e?.preventDefault();

    let url = "/jobs?";
    const queryParams: string[] = [];

    // Append search term if it exists
    if (search) {
      queryParams.push(`q=${search}`);
    }

    // Append selected job levels if any are selected
    if (selectedJobLevel.length > 0) {
      selectedJobLevel.forEach((level) => {
        queryParams.push(`jobLevel=${level}`);
      });
    }

    // Append selected employment types if any are selected
    if (selectedEmploymentType.length > 0) {
      selectedEmploymentType.forEach((type) => {
        queryParams.push(`employmentType=${type}`);
      });
    }

    // Append minimum salary if greater than 0
    if (minSalary > 0) {
      queryParams.push(`salary=${minSalary}`);
    }

    // Construct the final URL by joining all query parameters with '&'
    if (queryParams.length > 0) {
      url += queryParams.join("&");
    }

    // Redirect using the constructed URL
    router.push(url);
  };

  useEffect(() => {
    setJobs(data);
  }, [data]);

  useEffect(() => {
    if (searchParams.jobLevel) {
      setSelectedJobLevel(
        Array.isArray(searchParams.jobLevel)
          ? searchParams.jobLevel
          : [searchParams.jobLevel]
      );
    }

    if (searchParams.employmentType) {
      setSelectedEmploymentType(
        Array.isArray(searchParams.employmentType)
          ? searchParams.employmentType
          : [searchParams.employmentType]
      );
    }

    if (searchParams.salary) {
      setMinSalary(parseInt(searchParams.salary));
    }
  }, [searchParams]);

  return (
    <>
      <Head>
        <title>Job Nest | Jobs</title>
      </Head>
      <Navbar />
      <div className="md:py-10 py-7 md:px-16 px-5">
        <div className="w-full m-auto bg-background shadow-md border border-gray-200 md:rounded-full rounded-md md:h-16 h-auto md:py-0 py-6 px-4">
          <form
            onSubmit={handleFilter}
            className="flex md:flex-row flex-col justify-between items-center h-full gap-3"
          >
            <div className="flex w-full items-center gap-3 md:mb-0 mb-5 md:border-none border-b border-gray-200 md:pb-0 pb-3 flex-1">
              <AiOutlineSearch className="text-xl text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Job title or keyword"
                className="bg-background outline-0 h-full px-2 w-full text-sm"
              />
            </div>
            <button className="bg-[#504ED7] hover:bg-[#2825C2] transition-[background] text-white text-sm px-6 py-2 rounded-full outline-0">
              Search
            </button>
          </form>
        </div>
      </div>
      <Filter
        selectedJobLevel={selectedJobLevel}
        setSelectedJobLevel={setSelectedJobLevel}
        selectedEmploymentType={selectedEmploymentType}
        setSelectedEmploymentType={setSelectedEmploymentType}
        minSalary={minSalary}
        setMinSalary={setMinSalary}
        handleFilter={handleFilter}
      />
      <div className="bg-background pt-10 pb-7 md:px-16 px-5">
        {jobs.length === 0 ? (
          <div className="bg-red-500 text-center text-white rounded-md py-3">
            There's no job available.
          </div>
        ) : (
          <div className="grid gap-8 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
            {jobs.map((item) => (
              <JobCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default JobsClient;
