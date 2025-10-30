import ForgotPasswordForm from "@/components/forgotpasswordform";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";


export async function clientLoader(){
    return {};
}
export default function ForgotPassword(){
    return<div className="flex justify-center items-center ">
        <div className="md:w-1/2 p-6  rounded-lg shadow-lg space-y-2 ">
        <Link to="/login" className={cn(buttonVariants({variant: 'link'}), 'flex gap-2 items-center')}>
            <ArrowLeft className="w-5 h-5"/>
            Login
        </Link>
        <h2 className="text-2xl font-semibold mb-4 text-center text-purple-900">Forgot Password</h2>
            <ForgotPasswordForm/>
        </div>
    </div>
}