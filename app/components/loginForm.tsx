import { Link, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginValidationSchema, type LoginFormData } from "../types/auth";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "./authprovider";
import Loading from "./loading";
import { AxiosError } from "axios";
import { toastError } from "@/lib/toast";
const LoginForm = () =>{
    const {register, handleSubmit, formState:{errors}} = useForm<LoginFormData>({
        resolver: zodResolver(LoginValidationSchema),
    });
    const navigate = useNavigate();
    const {mutate, isPending} = useMutation({
        mutationFn: async (data:LoginFormData)=>{
            const response = await axiosInstance.post('/auth/login', data);
            return response.data;
            
        },
        onSuccess:()=>{
            navigate('/dashboard/home')
        },
        onError:(error)=>{
            if(error instanceof AxiosError){
                toastError(error.response?.data.message);
            }
        }
    })
    const onSubmit:SubmitHandler<LoginFormData> = (data)=>{
        mutate(data)
    }
    return(
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-1">
                <Label htmlFor="email" className="text-sm text-purple-900">Email</Label>
                <Input type="email" placeholder="Enter your email" className="" {...register('email')}/>
                {errors.email && <span className="text-red-500 text-sm font-medium">{errors.email.message}</span>}
            </div>
            <div className="space-y-1">
                <Label  htmlFor="password" className="text-sm text-purple-900 ">Password</Label>
                <Input type="password" placeholder="Password" className="outline-0 focus:outline-purple-400 focus:border-0" {...register('password')}/>
                {errors.password && <span className="text-red-500 text-sm font-medium">{errors.password.message}</span>}
            </div>
            <div>
                <Link to="/forgot-password" className="text-sm text-purple-900 hover:underline my-1">Forgot Password?</Link>
            </div>
            <div className="w-full">
                <Button className="w-full bg-purple-700 text-white font-semibold hover:bg-purple-500" disabled={isPending}>
                    Login
                    {isPending && <Loading/>}
                    
                </Button>
            </div>
        </form>
    )
}

export default  LoginForm;  