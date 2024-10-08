import { IJob } from "../utils/Interface";
import Head from "next/head";
import Navbar from "../components/general/Navbar";
import Footer from "../components/general/Footer";
import ReviewContainer from "../components/home/review/ReviewContainer";
import JobContainer from "../components/home/job/JobContainer";
import CategoryContainer from "../components/home/category/CategoryContainer";
import Jumbotron from "../components/home/Jumbotron";
import axios from "axios";

export interface ICategories {
  id: string;
  name: string;
  count: number;
  image: string;
}

interface IProps {
  latestJobs: IJob[];
  categories: ICategories[];
}

export default async function Home() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_API_BASE_URL}/api/jobs/latest-and-categories`,
    { next: { revalidate: 60 } }
  );
  const data = await res.json();
  const { latestJobs, categoryDisplay: categories } = data;

  const mappedLatestJobs = latestJobs?.map((item: any) => ({
    ...item,
    organization: {
      ...item?.organization,
      user: item?.organization?.users_permissions_user,
    },
    skills: item?.skills?.map((skill: any) => skill.jobSeekerSkill) || [],
    keywords: item?.keywords?.map((keyword: any) => keyword.jobKeyword) || [],
  }));

  return (
    <>
      <Head>
        <title>Job Nest | Home</title>
      </Head>
      <Navbar />
      <div>
        <Jumbotron />
        <CategoryContainer categories={categories} />
        <JobContainer jobs={mappedLatestJobs} />
        <ReviewContainer />
      </div>
      <Footer />
    </>
  );
}
