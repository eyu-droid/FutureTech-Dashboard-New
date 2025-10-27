import { Outlet } from "react-router";

export default function AuthLayout(){
    return (
        <div className="min-h-screen grid  lg:grid-cols-2 grid-cols-1 items-center justify-center">
            <div className="w-full ">
                <div className="block ">
                    <img src="/images/logo-future-2.png" alt="Future Tech Logo" className="w-40 h-40 mx-auto mb-4   object-contain"/>
                </div>
                <Outlet/>
            </div>
            <div className="w-full h-screen  bg-linear-to-tl from-purple-300 to-purple-800 hidden lg:block "></div>
        </div>
    )
}