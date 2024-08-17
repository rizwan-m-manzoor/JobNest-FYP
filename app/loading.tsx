import Loader from "@/components/general/Loader";

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-screen">
      <Loader size="xl" />
    </div>
  );
}
