import { usePathname } from "next/navigation";
import { RiBuilding2Fill } from "react-icons/ri";
import { BiCategory } from "react-icons/bi";
import Link from "next/link";

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="bg-secondary flex-1 border-gray-400 flex flex-col gap-5 items-center py-7">
      <Link
        href="/organization/approval"
        className={`block hover:bg-[#E2E1FF] hover:text-[#504ED7] ${
          pathname === "/organization/approval"
            ? "bg-[#E2E1FF] text-[#504ED7]"
            : "text-gray-400"
        } transition-[background] w-fit p-3 rounded-md w-fit h-fit`}
      >
        <RiBuilding2Fill className="text-2xl" />
      </Link>
      <Link
        href="/category"
        className={`block hover:bg-[#E2E1FF] hover:text-[#504ED7] ${
          pathname === "/category"
            ? "bg-[#E2E1FF] text-[#504ED7]"
            : "text-gray-400"
        } transition-[background] w-fit p-3 rounded-md w-fit h-fit`}
      >
        <BiCategory className="text-2xl" />
      </Link>
    </div>
  );
};

export default Sidebar;
