"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { IJobseeker } from "./../../../utils/Interface";
import { getDataAPI } from "./../../../utils/fetchData";
import { RootState } from "./../../../redux/store";
import Head from "next/head";
import Navbar from "./../../../components/general/Navbar";
import PDFViewer from "./../../../utils/PDFViewer";

const JobseekerCV = ({ params }: { params: { id: string } }) => {
  const [data, setData] = useState<Partial<IJobseeker>>({});

  const router = useRouter();

  const jobseekerId = params.id;
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDataAPI(
          `jobseeker/cv/${jobseekerId}`,
          auth.accessToken
        );
        setData(res.data.jobseeker);
      } catch (err: any) {
        dispatch({
          type: "alert/alert",
          payload: { error: err.response.data.msg },
        });
      }
    };

    fetchData();
  }, [auth, jobseekerId, dispatch]);

  useEffect(() => {
    if (!auth.accessToken) {
      router.push(`/login?r=cv/${jobseekerId}`);
    } else {
      if (auth.user?.role !== "organization" && auth.user?.role !== "admin") {
        router.push("/");
      }
    }
  }, [auth, jobseekerId, router]);

  return (
    <>
      <Head>
        <title>Job Nest | {data.user?.name} CV</title>
      </Head>
      <Navbar />
      <div className="md:py-10 py-7 md:px-16 px-8">
        <h1 className="text-2xl font-medium">{data.user?.name} CV</h1>
        {data.cv ? (
          <div className="mt-5">
            <PDFViewer file={`${data.cv}`} />
          </div>
        ) : (
          <p className="bg-red-500 text-center rounded-md w-full py-3 text-white mt-5 text-sm">
            CV not provided or incorrect jobseeker ID.
          </p>
        )}
      </div>
    </>
  );
};

export default JobseekerCV;
