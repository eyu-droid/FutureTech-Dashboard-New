import { Input } from "./ui/input"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import type { FC } from "react"
import { useMutation } from "@tanstack/react-query"
import { useAuth } from "./authprovider"
import axiosInstance from "@/lib/axiosinstance"
import Loading from "./loading"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { EmailSchema, type EmailType } from "@/types/email"
import { useSelectedEmailStore } from "store/selectedemailstore"
type EmailUIProps = {
    recepiantInfo: any[]
}
export const EmailUI:FC<EmailUIProps> = ({recepiantInfo}) => {
    const auth = useAuth();
    const {addSelectedUserEmail} = useSelectedEmailStore();
    const {register, handleSubmit, formState:{errors}} = useForm({
        resolver: zodResolver(EmailSchema)
    })
    const {mutate, isPending} = useMutation({
        mutationFn: async (data:any[])=>{
            const res = await axiosInstance.post('/mail/sendmail', {data: data},{
                headers:{
                    'Authorization': `Bearer ${auth?.token}`
                }
            });
            return res.data;
        }
    });
    const onSendEmail:SubmitHandler<EmailType> = (data)=>{
        const sendingInfo = recepiantInfo?.map((v) => ({
            reciver: v.email,
            attachedTo: v.entry_id,
            title: data.subject,
            body: data.body
        }));
        addSelectedUserEmail(sendingInfo);
        mutate(sendingInfo);
    }
    return (
        <Dialog>
            <DialogTrigger asChild disabled={recepiantInfo?.length===0}>
                <Button>
                    Send Email ({recepiantInfo?recepiantInfo.length:0})
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Send Mail</DialogTitle>
                    <DialogDescription>this message would be sent via a email</DialogDescription>
                </DialogHeader>
                <div>
                    <form className="space-y-4" onSubmit={handleSubmit(onSendEmail)} id="email-form">
                        <div className="space-y-1">
                            <Label>Recipiant</Label>
                            <Textarea  placeholder="Recipiants" value={recepiantInfo?.map((v)=>v.email).join(',')} rows={5} readOnly className="bg-gray-200"/>
                        </div>
                        <div className="space-y-1">
                            <Label>Subject</Label>
                            <Input type="text" placeholder="Subject" className="border-0" {...register('subject')}/>
                            {errors.subject && <p className="text-sm text-red-600">{errors.subject.message}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label>Message</Label>
                            <Textarea  placeholder="Message" rows={10} className="border-0" {...register('body')}/>
                            {errors.body && <p className="text-sm text-red-600">{errors.body.message}</p>}
                        </div>
                    </form>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant='ghost'>Cancle</Button>
                    </DialogClose>
                    <Button className="gap-2" disabled={isPending} form="email-form" type="submit">
                        Send
                        {isPending && <Loading/>}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 