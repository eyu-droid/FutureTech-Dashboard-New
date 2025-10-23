import DashboardHeader from "@/components/dashboardheader";
import DashboardSideBar from "@/components/dashboardsidebar";
import { Outlet } from "react-router";
import AuthProvider from "../components/authprovider";
import { MobileSideMenu } from "@/components/mobilesidemenu";

export default function DashboardLayout() {
  return (
    <AuthProvider>
      <div className="">
       {/* header component goes hear */}
        <div className="flex h-screen overflow-hidden gap-10 ">

            <MobileSideMenu/>
          {/* (<DashboardSideBar /> */}

          <div className="w-full my-10 md:max-w-[80%] overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
