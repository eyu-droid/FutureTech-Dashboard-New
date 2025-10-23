import { Check } from "lucide-react";

export function meta(){
    return[
        {title: "Completed - Future Tech Addis"},
        {name: "description", content:"Checkout - Complete"}
    ]
}

export function loader(){
    return{}
}

const Completed = ()=>{
    return(
        <div className="w-full h-screen">
            <div className="flex flex-col items-center justify-center mx-auto">
                <Check className="w-56 h-56 text-green-600"/>
                <span className="">Checkout Completed</span>
            </div>

        </div>
    )
}

export default Completed;