import type { FC } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { Delete, Trash } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { useFollowUpNoteStore } from "store/store";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { useMutation } from "@tanstack/react-query";
import type { FollowUpNotes } from "@/types/followupnotes";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "./authprovider";
import { toastError, toastSuccess } from "@/lib/toast";

type FollowUpPost = {
    title: string;
    description: string;
    noteId: string;
    followUpDate: string;
    isCompleted: number;
    clientName: string;
    followUpId: string;
}
const FollowUpList: FC<FollowUpPost> = ({ title, description, noteId, followUpDate, isCompleted, clientName, followUpId }) => {
    const { markCompleted, deleteNote } = useFollowUpNoteStore();
    const auth = useAuth()
    const { mutate, isPending } = useMutation({
        mutationFn: async (isCompleted:number) => {
            const res = await axiosInstance.post('/progress/followupnote/update/'+noteId, {isCompleted: isCompleted}, {
                headers: {
                    'Authorization': 'Bearer ' + auth?.token
                }
            });
            return res.data;
        },
        onSuccess(data, variables, context) {
            toastSuccess('updated')
        },
        onError(data, variables, context) {
            toastError('update failed. Please try again')
            if (variables) {
                markCompleted(noteId, 0)
            } else {
                markCompleted(noteId, 1);
            }
        },
    });

    const { mutate: deleteNoteById } = useMutation({
        mutationFn: async () => {
            const res = await axiosInstance.delete('/progress/followupnote/delete/' + noteId, {
                headers: {
                    'Authorization': 'Bearer ' + auth?.token
                }
            });
            return res.data;
        },
        onError: (error) => {
            toastError('delete failed. Please try again')

        }
    })

    const onCheck = (checked: CheckedState) => {
        if (checked) {

            markCompleted(noteId, 1);
            mutate(1)
            console.log()
        } else {
            markCompleted(noteId, 0)
            mutate(0)
        }
    }
    const onDelete = () => {
        deleteNote(noteId);
        deleteNoteById()
    }
    return (
        <div className="flex items-center justify-between">
            <div className="">
                <h3 className={cn("font-medium text-purple-500", { "line-through": isCompleted === 1 })}>{clientName}: <span className="font-semibold text-black">{title}</span></h3>
                <span className={cn("text-gray-600 text-sm ", { "line-through": isCompleted === 1 })}>Follow up date: {new Date(followUpDate).toDateString()}</span>
                <p className={cn("ml-1 text-sm my-1", { "line-through": isCompleted === 1 })}>{description}</p>
            </div>
            <div className="flex items-center gap-2">
                <Trash className="w-4 h-4 text-red-500" onClick={() => onDelete()} />
                <Checkbox onCheckedChange={(e)=>onCheck(e)} checked={isCompleted === 1} />
            </div>

        </div>
    );
}

export default FollowUpList;