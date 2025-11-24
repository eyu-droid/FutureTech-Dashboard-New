import { useEffect, type FC } from "react";
import { Button } from "./ui/button"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosinstance";
import { toastError, toastSuccess } from "@/lib/toast";
import { AxiosError } from "axios";
import Loading from "./loading";
import { useAuth } from "./authprovider";

type QRCodeSenderProps = {
    attendee: {
        email: string;
        phone: string;
        fullName: string;
        ticketType:string;
    }[]
}

export const QRCodeSender: FC<QRCodeSenderProps> = ({ attendee }) => {
    const auth = useAuth();
    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            // pass the current frontend origin to the backend so the generated email / print link
            // can use the correct base URL instead of defaulting to localhost.
            const frontendUrl = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '';
            const res = await axiosInstance.post('attendee/createBulkAttendees', { attendees: attendee, frontendUrl }, {
                headers: {
                    'Authorization': 'Bearer ' + auth?.token
                }
            });
            return res.data;
        },
        onSuccess(date, variables, context) {
            toastSuccess('QRcCode sender dispatched');
        },
        onError(error, variables, context) {
            if (error instanceof AxiosError) {
                toastError(error.response?.data.message);
            }
        }
    })
    const sendQRCode = () => {
        if (attendee && attendee.length > 0) {
            mutate();
        }
    }
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button disabled={attendee.length === 0 || isPending}>Send QRCode ({attendee.length}) </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm QRCode Dispatch</DialogTitle>
                </DialogHeader>
                <div>
                    <p className="text-gray-600">You are about to send a unique QR code email to {attendee.length} selected attendee(s).
                        This action will generate the QR code, link it to the attendee's profile in the database,
                        and trigger the email dispatch. Are you sure you want to proceed?
                    </p>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant='ghost'>Cancel</Button>
                    </DialogClose>
                    <Button onClick={()=>sendQRCode()}>Send Codes Now {isPending && <Loading />}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default QRCodeSender;