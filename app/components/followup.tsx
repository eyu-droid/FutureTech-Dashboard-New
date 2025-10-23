import { useState, type FC } from "react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Plus } from "lucide-react"
import { Button, buttonVariants } from "./ui/button"
import FollowUpList from "./followuplist"
import FollowForm from "./followupForm"
import { useMutation, useQuery } from "@tanstack/react-query"
import axiosInstance from "@/lib/axiosinstance"
import { cn } from "@/lib/utils"
import { Label } from "./ui/label"
import { Checkbox } from "./ui/checkbox"
import Loading from "./loading"
import { useAuth } from "./authprovider"
import { toast } from "sonner"
import { toastSuccess } from "@/lib/toast"
import type { CheckedState } from "@radix-ui/react-checkbox"
import { type response } from "@/types/response"
import { type FollowUpNotes } from "@/types/followupnotes"
import { type FollowUpListType } from "@/types/followup"
import useFollowUpStore, { useFollowUpNoteStore } from "store/store"
import CreateFollowUp from "./createfollowup"

type FollowUpProps = {
    entryId: number,
    clientName: string;
    open: boolean;
    initalFollowUp: FollowUpListType
}
const FollowUp: FC<FollowUpProps> = ({ entryId, clientName, open, initalFollowUp }) => {
    const auth = useAuth();

    const { followUp: testfollowup, changeStatus, getFollowUp } = useFollowUpStore();
    console.log(entryId);
    const currentFollowUp = getFollowUp(entryId);
    console.log(testfollowup, currentFollowUp)
    const { mutate: updateStatus, isPending: updating } = useMutation({
        mutationFn: async (status: "Completed" | "NotStarted") => {
            console.log()
            const res = await axiosInstance.post('/submission/followup/updatestatus', { status: status, followUpId: currentFollowUp?.id }, {
                headers: {
                    'Authorization': 'Bearer ' + auth?.token
                }
            });
            return res.data;
        },
        onSuccess: (data, status) => {
            toastSuccess('Status Updated');
             //setFollowUp(getFollowUp())
        },
        onError: (error, status) => {
            if (status === 'Completed') {
                changeStatus(entryId, 'NotStarted');
            } else {
                changeStatus(entryId, 'Completed');
            }
        }
    })
    const { initalNotes, notes } = useFollowUpNoteStore();
    const { data: followupNotes, isLoading: loadingNotes, refetch: fetchNotes } = useQuery({
        queryKey: ['notes', currentFollowUp?.id],
        queryFn: async () => {
            const res = await axiosInstance.get<response<FollowUpNotes[]>>('/progress/followupnote/' + currentFollowUp?.id, {
                headers: {
                    'Authorization': 'Bearer ' + auth?.token
                }
            });
            initalNotes(res?.data?.data);
            return res.data
        },
        enabled: open
    })
    const onChecked = (e: CheckedState) => {
        if (e) {
            updateStatus('Completed');
            changeStatus(entryId, 'Completed')

        } else {
            updateStatus('NotStarted');
            changeStatus(entryId, 'NotStarted');
        }
    }
    
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle >
                    Follow up

                </DialogTitle>
                <DialogDescription className="flex justify-between items-center">
                    Manage your followup
                    <div >


                        {
                            !currentFollowUp ? (

                                <CreateFollowUp entryId={entryId}/>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Label>Mark as Completed</Label>
                                    {!updating ?
                                        <Checkbox onCheckedChange={(e) => onChecked(e)} checked={currentFollowUp?.status === 'Completed'} /> : <Loading />

                                    }
                                </div>
                            )
                        }

                    </div>
                </DialogDescription>
            </DialogHeader>
            {
                currentFollowUp &&
                <div className="space-y-2">
                    <FollowForm entry_id={entryId} clientName={clientName} followUpId={initalFollowUp?.id} refetch={fetchNotes} />
                    <h1 className="text-lg text-gray-700 text-center underline">Notes</h1>
                    <div className="max-h-56 overflow-y-scroll">
                        {
                            !notes || notes?.length === 0 && (
                                <span className="text-center text-sm text-gray-600">No notes found</span>
                            )
                        }
                        {
                            notes && notes?.map((note: FollowUpNotes) => (
                                <FollowUpList title={note?.title} description={note?.description} noteId={note?.Id} isCompleted={note?.isCompleted} followUpDate={note?.followUpDate} clientName={clientName} followUpId={currentFollowUp?.id} key={note?.Id} />
                            ))
                        }
                    </div>
                </div>
            }
            <DialogFooter>

            </DialogFooter>
        </DialogContent>
    )

}

export default FollowUp;