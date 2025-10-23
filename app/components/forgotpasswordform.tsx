import { useForm, type SubmitHandler } from "react-hook-form"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { ForgorPasswordSchema, type ForgorPasswordType } from "@/types/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/lib/axiosinstance"
import { toast } from "sonner"
import Loading from "./loading"
import { useEffect } from "react"
import {XCircle} from 'lucide-react'
import { toastError, toastSuccess } from "@/lib/toast"
import type { response } from "@/types/response"
import { AxiosError } from "axios"


const ForgotPasswordForm = ()=>{
    const {register, handleSubmit, formState: {errors}} = useForm<ForgorPasswordType>({
        resolver: zodResolver(ForgorPasswordSchema)
    })

    const {mutate, isPending, isSuccess, isError, error, data} = useMutation({
        mutationFn: async (data:ForgorPasswordType)=>{
            const res =  await axiosInstance.post<response<any>>('/user/forgot-password',data);
            console.log(res.data)
            if(res.status == 200){
                return res.data
            }
        },
        onError:(error)=>{
            if(error instanceof AxiosError){
                toastError(error.response?.data.message)
            }
        },
        onSuccess: (data)=>{

            if(data)
            toastSuccess(data?.message)
        }
    })


    const onSubmit:SubmitHandler<ForgorPasswordType> = (data)=>{
        mutate(data)
    }
    return(
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input type="email" placeholder="Email" {...register('email')}/>
                {errors.email && <span className="text-sm text-red-500 font-medium">{errors.email.message}</span>}
            </div>
            <Button className="w-full bg-purple-700  font-semibold hover:bg-purple-500 text-white" disabled={isPending}>
                Send Email
                {isPending && <Loading/>}
            </Button>
        </form>
    )
}

export default ForgotPasswordForm;