import React from "react";
import axios from "axios";
import CandidatesClient from "./CandidatesClient";
import { cookies } from "next/headers";

async function getServerSideData(query: any, cookies: any) {
  const cookieData = cookies._parsed.get('jobnest_login_data')?.value;
  const loginData = cookieData ? JSON.parse(cookieData) : {};

  let url = `${process.env.NEXT_PUBLIC_STRAPI_API_BASE_URL}/api/job-seekers?[populate][users_permissions_user]=true&[populate][skills]=true`;

  const search = query.q;
  if (search) {
    url += `&filters[skills][jobSeekerSkill][$containsi]=${search}`;
  }

  const res = await fetch(url, {
    headers: {
      Authorization: loginData?.accessToken ? `Bearer ${loginData?.accessToken}` : "",
    },
    next: { revalidate: 30 }
  });

  const data = await res.json();

  const mappedResponse = data?.data?.map(({ id, attributes }: any) => {
    const { users_permissions_user, skills, ...restAttributes } = attributes;

    return {
      id,
      ...restAttributes,
      user: {
        id: users_permissions_user?.data?.id,
        ...users_permissions_user?.data?.attributes,
      },
      skills: skills?.data?.map(
        (item: any) => item?.attributes?.jobSeekerSkill
      ),
    };
  });

  return mappedResponse;
}

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: any;
}) {
  const cookieStore = cookies();
  const data = await getServerSideData(searchParams, cookieStore);

  return <CandidatesClient data={data} searchParams={searchParams} />;
}
