import { useNavigate, type ClientLoaderFunctionArgs, redirect } from "react-router";
import type { Route } from "../+types/root";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AttendeeValidationSchema, type AttendeeValidationType } from "@/types/attendee";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosinstance";
import type { response } from "@/types/response";
import { toastError, toastSuccess } from "@/lib/toast";
import { AxiosError } from "axios";
import Loading from "@/components/loading";
import { Check, Ticket } from "lucide-react";
import Fallback from "@/components/fallback";
import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Checkout - Future Tech Addis" },
    { name: "description", content: "Checkout page for tickets" },
  ];
}

export async function clientLoader({request}:ClientLoaderFunctionArgs){
    const url = new URL(request.url);
    const fullname = url.searchParams.get('fullname');
    const email = url.searchParams.get('email');
    const phone = url.searchParams.get('phone');
    const attendeType = url.searchParams.get('attendeType');
    console.log(attendeType);
    return {
        fullname,
        email,
        phone,
        attendeType
    }

}





const CheckOut = ({loaderData}: Route.ComponentProps)=>{
    const navigate = useNavigate();
    const reCaptchRef = useRef<ReCAPTCHA | null>(null);
    const {mutate, isPending} = useMutation({
        mutationFn: async(data:AttendeeValidationType)=>{
            const res = await axiosInstance.post<response<any>>('/attendee/checkout', data);
            return res.data;
        },
        onSuccess: (data)=>{
            if(data.data){
                toastSuccess('Order Created Successfull. Please check your email for the ticket.');
                const timer = setTimeout(()=>{
                    window.location.href = 'https://futuretechaddis.com'

                }, 3000);
                return ()=>{
                    clearTimeout(timer);
                }
            }
        },
        onError:(error)=>{
            if(error instanceof AxiosError){
                toastError(error.response?.data.message);
            }
        }
    })
    const [fullName, setFullName] = useState("Full name");
    const [email, setEmail] = useState("youremail@domain.com");
    const [phone, setPhone] = useState("000 000 000")
    const {register, handleSubmit, formState:{errors}, getValues, setError, setValue} = useForm<AttendeeValidationType>({
        resolver: zodResolver(AttendeeValidationSchema),
        defaultValues:{
            email: loaderData.email,
            fullname: loaderData.fullname,
            phone: loaderData.phone,

        },
        
    });
    const submit:SubmitHandler<AttendeeValidationType> = (data)=>{
        if(getValues('recaptchaToken') === undefined){
            setError('recaptchaToken', {message: 'Please complete the reCAPTCHA'});
            return;
        }
        mutate(data)
    }
    return(
        <div className="overflow-auto">
           
            <form className="space-y-4 md:w-[60%] mx-auto" onSubmit={handleSubmit(submit)}>
                <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
                    <div className="space-y-2">
                        <Label htmlFor="fullname">Full Name</Label>
                        <Input type="text" {...register('fullname')} onChange={(e)=>setFullName(e.target.value)}/>
                        {errors.fullname && <span className="text-red-500 text-sm font-semibold">{errors.fullname?.message}</span>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input type="email" {...register('email')} onChange={(e)=>setEmail(e.target.value)}/>
                        {errors.email && <span className="text-red-500 text-sm font-semibold">{errors.email?.message}</span>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input type="tel" {...register('phone')} onChange={(e)=>setPhone(e.target.value)}/>
                        {errors.phone && <span className="text-red-500 text-sm font-semibold">{errors.phone?.message}</span>}
                    </div>
                    <div className="space-y-2">
                        <ReCAPTCHA   sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY} onChange={(value)=>{
                            setValue('recaptchaToken', value || undefined);
                        }}/>
                        {errors.recaptchaToken && <span className="text-red-500 text-sm font-semibold">{errors.recaptchaToken?.message}</span>}
                    </div>
                </div>
                <Button className="w-full bg-purple-500 text-white font-medium" disabled={isPending}>
                    Order
                    {!isPending && <Ticket className="w-5 h-5"/>}
                    {isPending && <Loading/>}
                </Button>
            </form>
            <div className="max-w-fit mt-10 mx-auto  rounded-md  border-gray-400 md:block hidden">
                <div className="w-full p-5 bg-purple-500 flex flex-wrap items-center  gap-3">
                    <img src="https://futuretechaddis.com/wp-content/uploads/2025/04/logo-future-.png" className="w-16 h-16 object-contain"/>
                    <div className="flex flex-col ">
                        <span className="text-white text-lg font-extrabold">Future Tech Addis Invitation Ticket</span>
                        <span className="text-white/80 text-sm font-semibold">November 28 - November 30, 2025</span>
                    </div>
                </div>
                <div className="flex flex-wrap items-center p-3 gap-2">
                <div className="border border-gray-300">
                    <img src="/images/sample.png" className=""/>
                </div>
                <div className="grid md:grid-cols-2 grid-cols-1 gap-2 items-center">
                    <div className="flex gap-2 items-center">
                        <span className="font-thin uppercase">Name:</span>
                        <span className="border-b border-dotted border-gray-300 font-normal">{fullName}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                        <span className="font-thin uppercase">Email:</span>
                        <span className="border-b border-gray-300">{email}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                        <span className="font-thin uppercase">Phone:</span>
                        <span className="border-b border-gray-300">{phone}</span>
                    </div>
                </div>
            </div>
            </div>
            

        </div>
    )
}

export default CheckOut;