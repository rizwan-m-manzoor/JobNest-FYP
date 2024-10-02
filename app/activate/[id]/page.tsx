import React from "react";
import axios from "axios";
import ActivateAccountClient from "./ActivateAccountClient";

async function getServerSideData(id: string) {
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_STRAPI_API_BASE_URL}/api/auth/activate`,
      {
        token: id,
      }
    );

    return { success: res.data.msg };
  } catch (err: any) {
    return { error: err.response.data.error.message };
  }
}

export default async function ActivateAccount({
  params,
}: {
  params: { id: string };
}) {
  const { success, error } = await getServerSideData(params.id);

  if (success) {
    return <ActivateAccountClient success={success} />;
  } else if (error) {
    return <ActivateAccountClient error={error} />;
  }

  // Return a fallback in case neither success nor error is available
  return <></>;
}
