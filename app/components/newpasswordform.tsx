import { useForm, type SubmitHandler } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { PasswordResetSchema, type PasswordResetType } from "@/types/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosinstance";
import type { response } from "@/types/response";
import { toastError } from "@/lib/toast";
import { useNavigate } from "react-router";
import Loading from "./loading";
import type { FC } from "react";

const ResetPasswordForm:FC<{token:string}> = ({token})=>{
    const {register, handleSubmit, formState:{errors}} = useForm<PasswordResetType>({
        resolver: zodResolver(PasswordResetSchema)
    });
    const navigate = useNavigate();
    
    const {mutate, isPending} = useMutation({
        mutationFn: async (data:PasswordResetType)=>{
            const res = await axiosInstance.post<response<any>>('/user/change-password/'+token,{password: data.password})
            return res.data
        },
        onError:(error)=>{
            toastError('token expired please resend token')
        },
        onSuccess: (data)=>{
            navigate('/login');
        }
    })
    const onSubmit:SubmitHandler<PasswordResetType> = (data)=>{
        mutate(data)
    }
    return(
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input type="password" placeholder="Password" {...register('password')}/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Confirm Password</Label>
                <Input type="password" placeholder="Confirm Password" {...register('confirmPassword')}/>
            </div>
            <div>
                <Button className="w-full bg-purple-500 text-white text-sm font-medium" disabled={isPending}>
                    Reset Password
                    {isPending && <Loading/>}
                </Button>
            </div>
        </form>
    )
}

export default ResetPasswordForm;