import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./authprovider"
import axiosInstance from "@/lib/axiosinstance";
import { UserSquare2 } from "lucide-react";

const DashboardHeader = () => {
    
    return (
        <div className="w-full shadow-md flex justify-between items-center px-10 bg-linear-150 from-purple-900 to-purple-500 text-white">
            <img src="https://futuretechaddis.com/wp-content/uploads/2025/04/logo-future-.png" className="w-20 h-20 object-contain" alt="Future Tech Addis Logo" width={100} height={100}/>
            <UserSquare2 className="w-10 h-10 rounded-full "/>
        </div>
    )
}

export default DashboardHeader