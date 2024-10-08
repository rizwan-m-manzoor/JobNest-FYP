import React from "react";
import axios from "axios";
import JobsClient from "./JobsClient";

async function getServerSideData(query: any) {
  const { q, jobLevel, employmentType, salary } = query;

  // Base URL with populate parameters
  let url = `${process.env.NEXT_PUBLIC_STRAPI_API_BASE_URL}/api/jobs?populate[skills]=true&populate[keywords]=true&populate[organization][populate][users_permissions_user]=true&`;

  // Append the query parameter `q` if it exists
  if (q) {
    url += `filters[position][$containsi]=${q}&`;
  }

  // Append the `jobLevel` filter(s)
  if (jobLevel) {
    if (Array.isArray(jobLevel)) {
      jobLevel.forEach((level: string) => {
        url += `filters[jobLevel][$eq]=${level}&`;
      });
    } else {
      url += `filters[jobLevel][$eq]=${jobLevel}&`;
    }
  }

  // Append the `employmentType` filter(s)
  if (employmentType) {
    if (Array.isArray(employmentType)) {
      employmentType.forEach((type: string) => {
        url += `filters[employmentType][$eq]=${type}&`;
      });
    } else {
      url += `filters[employmentType][$eq]=${employmentType}&`;
    }
  }

  // Append the `salary` filter
  if (salary) {
    url += `filters[salary][$eq]=${salary}&`;
  }

  // Remove the trailing '&' at the end of the URL string
  url = url.endsWith("&") ? url.slice(0, -1) : url;

  try {
    const res = await fetch(url, { next: { revalidate: 30 } });
    const data = await res.json();

    const mappedResponse = data?.data?.map(({ id, attributes }: any) => {
      const { organization, skills, keywords, ...restAttributes } = attributes;

      const { users_permissions_user, ...restOrganizationAttributes } =
        organization.data.attributes;

      return {
        id,
        ...restAttributes,
        organization: {
          id: organization?.data?.id,
          ...restOrganizationAttributes,
          user: {
            id: users_permissions_user?.data?.id,
            ...users_permissions_user?.data?.attributes,
          },
        },
        skills: skills.data?.map(
          (item: any) => item?.attributes?.jobSeekerSkill
        ),
        keywords: keywords.data?.map(
          (item: any) => item?.attributes?.jobKeyword
        ),
      };
    });

    return mappedResponse;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: any;
}) {
  const data = await getServerSideData(searchParams);

  return <JobsClient data={data} searchParams={searchParams} />;
}
