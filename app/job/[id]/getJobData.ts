import axios from "axios";

export async function getJobData(id: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_BASE_URL}/api/jobs/${id}`,
      { next: { revalidate: 30 } }
    );

    const data = await res.json();
    const { organization, keywords, skills, ...restData } = data;
    const { users_permissions_user, ...organizationWithoutUser } = organization;

    const formattedData = {
      ...restData,
      organization: {
        ...organizationWithoutUser,
        user: users_permissions_user,
      },
      keywords: keywords?.map((item: any) => item.jobKeyword),
      skills: skills?.map((item: any) => item.jobSeekerSkill),
    };
    return formattedData;
  } catch (err) {
    return null;
  }
}
