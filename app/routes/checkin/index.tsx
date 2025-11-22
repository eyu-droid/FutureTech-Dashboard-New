import AttendeeTable from "@/components/attendeestable";
import Fallback from "@/components/fallback";
import HtmlQRCode from "@/components/htmlqrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import axiosInstance from "@/lib/axiosinstance";
import { toastError, toastSuccess } from "@/lib/toast";
import type { AttendeeResponse } from "@/types/attendee";
import type { response } from "@/types/response";
import { useMutation, useQuery } from "@tanstack/react-query";
import { QrCode } from "lucide-react";
import type { Route } from "./+types";
import type { IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { useAuth } from "@/components/authprovider";
import { AxiosError } from "axios";
import Loading from "@/components/loading";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/debounce";
import { columns } from "@/components/tablecolumns/attendeecolumns";
import { toast } from "sonner";


export function meta({}:Route.MetaArgs){
    return[
        { title: 'CheckIn - Future Tech Addis' },
        {name: 'description', content: 'Checkin page'}
    ]
}

export function clientLoader(){
    
}

export function HydrateFallback(){
    return <Fallback/>
}

const Index = ()=>{
    const auth = useAuth();
    const [filter, setFilter] = useState('');
    const debounceSearchTerm = useDebounce(filter, 500);
    const {data, isLoading, isError , refetch} = useQuery({
        queryKey: ['attendees', debounceSearchTerm],
        queryFn: async ()=>{
            const res = await axiosInstance.get<response<AttendeeResponse[]>>('attendee/getAllAttendees?query='+ filter);
            return res.data
        },
        
    })
   
    // state to hold check-in result and UI flags
    const [checkedInData, setCheckedInData] = useState<any | null>(null);
    const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const {mutate, isPending} = useMutation({
        mutationFn: async(orderCode:string)=>{
            const res = await axiosInstance.post<response<any>>('/attendee/checkin', {orderNo:orderCode},{
                headers:{
                    'Authorization': 'Bearer '+auth?.token
                }
            });
            return res.data;
        },
        onSuccess: (data)=>{
            // Show a single, appropriate toast and avoid duplicate toasts for the 'already' case.
            // Use a less-intrusive info toast for 'Already checked in' and the regular success toast for first-time check-in.
            if (data && data.message) {
                if (data.message === 'Already checked in') {
                    // less prominent message when someone was already checked
                    toast.info(data.message);
                } else {
                    toastSuccess(data.message);
                }
            }
            // If backend returned order and attendee, show modal with details and refresh the attendees list
            if(data && data.data){
                setCheckedInData(data.data);
                setShowDetails(false);
                setIsCheckinModalOpen(true);
                // refetch the attendees list so the table reflects the updated CHECKEDIN status
                try {
                    refetch();
                } catch (err) {
                    // ignore refetch errors here; table will refresh on user action
                }
            }
        },
        onError: (error)=>{
            if(error instanceof AxiosError){
                toastError(error.response?.data.message)
            }
        }
    })
    useEffect(()=>{
        if(isPending){
            toast.info('Verifing ticket',{icon:<Loading/>,cancel:!isPending, position:'top-center'})
        }
    }, [isPending])
   const onQRSuccess = (result:IDetectedBarcode[])=>{
    const orderCode = result[0].rawValue
    mutate(orderCode);
   }
   const onQRError = (error:unknown)=>{

   }
    return(
        <div>
            <div className="space-y-3">
                <h3 className="font-semibold text-2xl">Event checkin</h3>
                <div className="flex  items-center gap-2 ">
                    <Input placeholder="Search by email, Full name..." onChange={(e)=>setFilter(e.target.value)} />
                    <HtmlQRCode onQRCodeSuccess={onQRSuccess} onQRCodeError={onQRError}/>
                </div>
                {
                    isLoading && <Loading/>
                }
                {
                    data?.data && <AttendeeTable attendeeData={data?.data} columns={columns}/>
                }

                {/* Simple modal shown after a successful check-in (from QR scan or manual entry) */}
                {isCheckinModalOpen && checkedInData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="relative z-50 max-w-md w-full mx-4">
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold">Checked in</h3>
                                        <p className="text-sm text-muted-foreground">Ticket verified successfully</p>
                                    </div>
                                    <button aria-label="Close" onClick={()=> setIsCheckinModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <div><strong>Name:</strong> {checkedInData.attendee?.fullname ?? 'N/A'}</div>
                                    <div><strong>Email:</strong> {checkedInData.attendee?.email ?? 'N/A'}</div>
                                    <div><strong>Phone:</strong> {checkedInData.attendee?.phone ?? 'N/A'}</div>
                                    <div><strong>Ticket Type:</strong> {checkedInData.order?.ticket ?? 'N/A'}</div>
                                    <div><strong>Registered:</strong> {checkedInData.attendee?.createdAt ? new Date(checkedInData.attendee.createdAt).toLocaleString() : 'N/A'}</div>
                                </div>

                                <div className="mt-4 flex gap-2">
                                    <Button onClick={() => setShowDetails(v => !v)}>{showDetails ? 'Hide Details' : 'View Details'}</Button>
                                    <Button variant="ghost" onClick={()=> setIsCheckinModalOpen(false)}>Close</Button>
                                </div>

                                {showDetails && (
                                    <div className="mt-4 border-t pt-4 space-y-2 text-sm">
                                        {/* Render extra fields if present in payload; fallback to N/A */}
                                        {checkedInData.order?.ticket === 'Event' ? (
                                            <>
                                                <div><strong>Sector of Interest:</strong> {checkedInData.attendee?.sectorOfInterest ?? 'N/A'}</div>
                                                <div><strong>Ticket Type:</strong> {checkedInData.order?.ticket ?? 'N/A'}</div>
                                                <div><strong>Registered Date:</strong> {checkedInData.attendee?.createdAt ? new Date(checkedInData.attendee.createdAt).toLocaleString() : 'N/A'}</div>
                                            </>
                                        ) : (
                                            <>
                                                <div><strong>Want Investment Opportunity:</strong> {checkedInData.attendee?.investmentOpportunity ?? 'N/A'}</div>
                                                <div><strong>Profession:</strong> {checkedInData.attendee?.profession ?? 'N/A'}</div>
                                                <div><strong>Sector of Interest:</strong> {checkedInData.attendee?.sectorOfInterest ?? 'N/A'}</div>
                                                <div><strong>Attend Workshop:</strong> {checkedInData.attendee?.workshop ?? 'N/A'}</div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="fixed inset-0 bg-black opacity-30" onClick={()=> setIsCheckinModalOpen(false)} />
                    </div>
                )}
            </div>

        </div>
    )
}

export default Index;