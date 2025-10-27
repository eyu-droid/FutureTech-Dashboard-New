import { Check } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export function meta(){
    return[
        {title: "Completed - Future Tech Addis"},
        {name: "description", content:"Checkout - Complete"}
    ]
}

export function clientLoader(){
    return{}
}

const Completed = ()=>{
    const navigate = useNavigate();
    useEffect(()=>{
        const timer = setTimeout(()=>{
            window.location.href = 'https://futuretechaddis.com';
        },3000)
    },[])
    return(
        <div className="w-full h-screen">
            <div className="flex flex-col items-center justify-center mx-auto">
                <Check className="w-56 h-56 text-green-600"/>
                <span className="">Checkout Completed</span>
                <span className="text-sm text-gray-500">You will be redirected to home page shortly</span>
            </div>

        </div>
    )
}

export default Completed;