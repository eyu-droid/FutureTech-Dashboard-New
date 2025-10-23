import { useEffect, useState, type FC } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type FollowUpType, FollowUpValidation } from "@/types/followup";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosinstance";
import Loading from "./loading";
import { useAuth } from "./authprovider";
import { toastError, toastSuccess } from "@/lib/toast";

import { useFollowUpNoteStore } from "store/store";


type FollowFormProps = {
    entry_id:number,
    followUpId:string,
    clientName:string,
    refetch:(option?:any)=>Promise<any>
    
}
const FollowForm:FC<FollowFormProps> = ({entry_id, clientName, followUpId, refetch})=>{
    const auth = useAuth();
    const {addNote, deleteNote} = useFollowUpNoteStore();
    const [tempId, setTempId] = useState('');
    const {register, handleSubmit, formState:{errors}, } = useForm<FollowUpType>({
        resolver: zodResolver(FollowUpValidation),
        defaultValues:{
            clientName: clientName,
        },
    });
    const {mutate, isPending} = useMutation({
        mutationFn: async (data:any)=>{
            const res = await axiosInstance.post('/progress/followupnote/create',data,{
                headers:{
                    'Authorization': 'Bearer '+ auth?.token
                }
            })
            return res.data
        },
        onSuccess: ()=>{
            toastSuccess('Note added');
           
        },
        onError:(error, data)=>{
            
            deleteNote(tempId)
            toastError(error.message)
        }
    })
    const submit:SubmitHandler<FollowUpType> = (data)=>{
        const sendData = {
            title: data.title,
            description: data.note,
            followUpDate: data.folloUpDate,
            followUpId
        }
        setTempId((prev)=>(Date.now().toString(36) + Math.random().toString(36).slice(2)).toString());
        addNote({title: data.title, description: data.note, followUpDate: data.folloUpDate, followUpId:followUpId, Id:tempId, isCompleted:0})
        mutate(sendData)
        
    }
    return(
        <div className="">
           

                    <form className="space-y-3"  onSubmit={handleSubmit(submit)}>
                            {/* <div>
                                <Input value={entry_id} readOnly hidden {...register('entry_id')}/>
                                {errors.entry_id && <span>{errors.entry_id.message}</span>}
                            </div> */}
                        <div className="flex flex-col  gap-2">
                            <div className="space-y-2">
                                <Label>Client Name</Label>
                                <Input placeholder="Client Name..." {...register('clientName')} readOnly/>
                                {errors.clientName && <span className="text-sm text-red-500">{errors.clientName.message}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input  {...register('title')}/>
                                {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
                            </div>
                        </div>
                        <div className="space-y-2">
                                <Label>Follow-up Date</Label>
                                <Input type="date" {...register('folloUpDate')}/>
                                {errors.folloUpDate && <span className="text-red-500 text-xs">{errors.folloUpDate.message}</span>}
                            </div>
                        <div className="w-full space-y-3">
                            <Label>Note</Label>
                            <Textarea placeholder="note..." {...register('note')} rows={10}/>
                            {errors.note && <span className="text-red-500">{errors.note.message}</span>}
                        </div>
                        <div className="w-full flex justify-end">
                            <Button variant="ghost" className="bg-purple-500 text-white ">
                                Add Followup
                                {
                                    isPending && <Loading/>
                                }
                            </Button>

                        </div>
                    </form>
              
        </div>
    )
}

export default FollowForm;