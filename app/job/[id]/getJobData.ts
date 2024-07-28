import axios from "axios";

export async function getJobData(id: string) {
  try {
    const res = await axios.get(`${process.env.CLIENT_URL}/api/job/${id}`);
    return res.data.job[0];
  } catch (err) {
    return null;
  }
}
