import axios from "axios";

export async function getJobData(id: string) {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_STRAPI_API_BASE_URL}/api/jobs/${id}`
    );

    const { organization, keywords, skills, ...restData } = res.data;
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
