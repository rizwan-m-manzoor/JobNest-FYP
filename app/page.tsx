import { IJob } from '../utils/Interface';
import Head from 'next/head';
import Navbar from '../components/general/Navbar';
import Footer from '../components/general/Footer';
import ReviewContainer from '../components/home/review/ReviewContainer';
import JobContainer from '../components/home/job/JobContainer';
import CategoryContainer from '../components/home/category/CategoryContainer';
import Jumbotron from '../components/home/Jumbotron';
import axios from 'axios';

export interface ICategories {
  _id: string;
  name: string;
  count: number;
  image: string;
}

interface IProps {
  latestJobs: IJob[];
  categories: ICategories[];
}

export default async function Home() {
  // const res = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_API_BASE_URL}/api/auth/local`);
  // const { latestJob: latestJobs, categoryDisplay: categories } = res.data;

  return (
    <>
      <Head>
        <title>Job Nest | Home</title>
      </Head>
      <Navbar />
      <div>
        <Jumbotron />
        {/* <CategoryContainer categories={categories} />
        <JobContainer jobs={latestJobs} /> */}
        <ReviewContainer />
      </div>
      <Footer />
    </>
  );
}