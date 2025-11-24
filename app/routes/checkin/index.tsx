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
        queryKey: ['checkinList', debounceSearchTerm],
        queryFn: async ()=>{
            // Fetch a page of attendees enriched with order/checkin info from the backend endpoint.
            // The backend returns { items: [...], meta: { total, page, limit, pages } }
            const res = await axiosInstance.get('/attendee/getCheckInList?page=1&limit=100&query=' + encodeURIComponent(filter), {
                headers: {
                    'Authorization': 'Bearer ' + auth?.token
                }
            });
            return res.data;
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
                // We'll refresh the check-in list when the modal is closed so the user can review the details first
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
                    // Render the check-in list returned by the new API.
                    // The API returns a payload with .data.items and pagination meta.
                    data?.data?.items && data.data.items.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm table-auto border-collapse">
                                <thead>
                                    <tr className="text-left">
                                        <th className="p-2">ID</th>
                                        <th className="p-2">Full Name</th>
                                        <th className="p-2">Email</th>
                                        <th className="p-2">Phone</th>
                                        <th className="p-2">Ticket</th>
                                        <th className="p-2">Checked In</th>
                                        <th className="p-2">Checked Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.data.items.map((item:any) => (
                                        <tr key={item.id} className="border-t">
                                            <td className="p-2 align-top">{item.id}</td>
                                            <td className="p-2 align-top">{item.fullname}</td>
                                            <td className="p-2 align-top">{item.email}</td>
                                            <td className="p-2 align-top">{item.phone ?? 'N/A'}</td>
                                            <td className="p-2 align-top">{item.order?.ticket ?? 'N/A'}</td>
                                            <td className="p-2 align-top">{item.checkedIn ? 'Yes' : 'No'}</td>
                                            <td className="p-2 align-top">{item.checkedTime ? new Date(item.checkedTime).toLocaleString() : 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : null
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
                                    <button aria-label="Close" onClick={()=>{
                                        setIsCheckinModalOpen(false);
                                        try { refetch(); } catch (e) { /* ignore */ }
                                    }} className="text-gray-500 hover:text-gray-700">✕</button>
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
                                    <Button variant="ghost" onClick={()=>{
                                        setIsCheckinModalOpen(false);
                                        try { refetch(); } catch (e) { /* ignore */ }
                                    }}>Close</Button>
                                </div>

                                {showDetails && (
                                    <div className="mt-4 border-t pt-4 space-y-2 text-sm">
                                        {/* Merge multiple possible fields so we don't show 'N/A' when data exists under alternate keys */}
                                        {(() => {
                                            const attendee = checkedInData.attendee || {};
                                            const sector = attendee.sectorOfInterest || attendee.areaInterest || attendee.other || attendee.sector || 'N/A';
                                            const profession = attendee.profession || attendee.position || attendee.job || 'N/A';
                                            const investment = attendee.investmentOpportunity || attendee.investment || attendee.wantInvestment || 'N/A';
                                            const workshop = attendee.workshop || attendee.attendWorkshop || 'N/A';
                                            const ticketType = checkedInData.order?.ticket || checkedInData.order?.ticketType || 'N/A';
                                            const registered = attendee.createdAt ? new Date(attendee.createdAt).toLocaleString() : 'N/A';
                                            return (
                                                <>
                                                    <div><strong>Sector of Interest:</strong> {sector}</div>
                                                    <div><strong>Profession:</strong> {profession}</div>
                                                    <div><strong>Want Investment Opportunity:</strong> {investment}</div>
                                                    <div><strong>Attend Workshop:</strong> {workshop}</div>
                                                    <div><strong>Ticket Type:</strong> {ticketType}</div>
                                                    <div><strong>Registered Date:</strong> {registered}</div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="fixed inset-0 bg-black opacity-30" onClick={()=>{
                            setIsCheckinModalOpen(false);
                            try { refetch(); } catch (e) { /* ignore */ }
                        }} />
                    </div>
                )}
            </div>

        </div>
    )
}

export default Index;