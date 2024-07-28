import React from "react";
import axios from "axios";
import CandidatesClient from "./CandidatesClient";

export async function getServerSideData(query: any) {
  let url = `${process.env.CLIENT_URL}/api/jobseeker`;

  const search = query.q;
  if (search) {
    url += `?q=${search}`;
  }

  const res = await axios.get(url);
  return res.data.jobseekers;
}

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: any;
}) {
  const data = await getServerSideData(searchParams);

  return <CandidatesClient data={data} searchParams={searchParams} />;
}
