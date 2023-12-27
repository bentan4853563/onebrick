import { Link } from "react-router-dom";

import { HiOutlineUsers } from "react-icons/hi2";
import { BsBricks } from "react-icons/bs";
import { LuLayoutDashboard } from "react-icons/lu";
import { GoFileMedia } from "react-icons/go";

import WhiteLogo from "../../assets/img/logo-white.png";

const Sidebar = () => {
  return (
    <div className="w-full h-full flex flex-col bg-[#32363f] text-white items-center">
      <Link
        to="/"
        className="font-bold font-raleway text-center lg:text-2xl 2xl:text-3xl py-12"
      >
        <img src={WhiteLogo} className="pr-6" />
      </Link>
      <hr className="w-full border-gray-500" />
      <div className="w-full flex flex-col gap-4 py-8 px-8 text-white">
        <Link
          to="/admin"
          className="flex items-center gap-3 cursor-pointer hover:text-sky-500"
        >
          <LuLayoutDashboard />
          <p className="text-md 2xl:text-lg font-montserrat">Dashboard</p>
        </Link>
        <Link
          to="/admin/bricks"
          className="flex items-center gap-3 cursor-pointer hover:text-sky-500"
        >
          <BsBricks />
          <p className="text-md 2xl:text-lg font-montserrat">Bricks</p>
        </Link>
        <Link
          to="/admin/donors"
          className="flex items-center gap-3 cursor-pointer hover:text-sky-500"
        >
          <HiOutlineUsers />
          <p className="text-md 2xl:text-lg font-montserrat">Donors</p>
        </Link>
        <Link
          to="/admin/manage"
          className="flex items-center gap-3 cursor-pointer hover:text-sky-500"
        >
          <GoFileMedia />
          <p className="text-md 2xl:text-lg font-montserrat">Management</p>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
