import React from "react";
import axios from "axios";
import JobsClient from "./JobsClient";

export async function getServerSideData(query: any) {
  const { q, jobLevel, employmentType, salary } = query;

  let url = `${process.env.CLIENT_URL}/api/job/all?`;

  if (q) {
    url += `q=${q}&`;
  }

  if (jobLevel) {
    if (Array.isArray(jobLevel)) {
      jobLevel.forEach((level: string, index: number) => {
        url += `jobLevel=${level}${index !== jobLevel.length - 1 ? "&" : ""}`;
      });
    } else {
      url += `jobLevel=${jobLevel}&`;
    }
  }

  if (employmentType) {
    if (Array.isArray(employmentType)) {
      employmentType.forEach((type: string, index: number) => {
        url += `employmentType=${type}${
          index !== employmentType.length - 1 ? "&" : ""
        }`;
      });
    } else {
      url += `employmentType=${employmentType}&`;
    }
  }

  if (salary) {
    url += `salary=${salary}&`;
  }

  const res = await axios.get(url);
  return res.data.jobs;
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: any;
}) {
  const data = await getServerSideData(searchParams);

  return <JobsClient data={data} searchParams={searchParams} />;
}
