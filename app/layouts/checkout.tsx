import { Outlet } from "react-router";

export default function CheckoutLayout(){
    return(
        <div className="md:w-[70%] w-[80%] mx-auto ">
            <div className="flex items-center justify-between my-10">
                <img src="/logo-future-2.png" className="md:w-32 md:h-20 w-20  object-contain" alt="Future Tech Addis Logo"/>
                <h4 className="font-semibold">Checkout Page</h4>
            </div>
            <Outlet/>
        </div>
    )
}