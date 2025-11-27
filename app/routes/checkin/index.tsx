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
import { useEffect, useState, useMemo } from "react";
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
        queryKey: ['confirmedList', debounceSearchTerm],
        queryFn: async ()=>{
            // Fetch the flat list of confirmed rows from the legacy `confirmed` table.
            // Response shape is: { message: 'fetched successful', data: [ { fullname, phone, email, registereddate, checkedindate }, ... ] }
            const res = await axiosInstance.get('/attendee/getConfirmedList', {
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

    // per-row detail modal state (opened by "Check Details" button)
    const [detailData, setDetailData] = useState<any | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // fetch event submissions to map emails -> entry_id (so checkin table shows the event entry_id when available)
    const { data: eventSubmissionsRaw } = useQuery({
        queryKey: ['eventSubmissions'],
        queryFn: async () => {
            const res = await axiosInstance.get('/register/submission/event', {
                headers: {
                    'Authorization': 'Bearer ' + auth?.token
                }
            });
            // endpoint returns { message, data: [...] } — return data array
            return res.data?.data ?? [];
        },
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10
    });

    const eventEmailToEntryId = useMemo(() => {
        const m = new Map<string, string | number>();
        (eventSubmissionsRaw || []).forEach((s: any) => {
            const email = (s.email || s.emailAddress || s.emailAddressRaw) ?? null;
            if (email) {
                // normalize to lowercase for robust lookup
                m.set(String(email).toLowerCase(), s.entry_id ?? s.entryId ?? s.id ?? null);
            }
        });
        return m;
    }, [eventSubmissionsRaw]);

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
                // Refresh the confirmed list immediately so the table reflects the newly checked-in row
                try { refetch(); } catch (e) { /* ignore */ }
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
                {/* Render the check-in list returned by the new API.
                    The API returns a payload with .data.items and pagination meta.
                    Always render the table and show a message when there are no items. */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm table-auto border-collapse">
                        <thead>
                            <tr className="text-left">
                                <th className = "p-2">ID</th>
                                <th className="p-2">Full Name</th>
                                <th className="p-2">Email</th>
                                <th className="p-2">Phone</th>
                                <th className="p-2">Registered Date</th>
                                <th className="p-2">Checked In Date</th>
                                <th className="p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                // operate on the confirmed rows returned by the new endpoint
                                // expected shape: data.data -> array of confirmed rows
                                const itemsArr = data?.data ?? [];
                                if (itemsArr.length === 0) {
                                    // log the full response to the browser console so the user can inspect the payload
                                    console.debug('Confirmed response', data);
                                    return (
                                        <>
                                            <tr className="border-t">
                                                            <td className="p-2 align-top" colSpan={7}>No attendees found.</td>
                                                        </tr>
                                                        <tr className="border-t">
                                                            <td className="p-2 align-top" colSpan={7}>
                                                                {/* JSON dump of the response so it's visible in the UI for debugging */}
                                                                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
                                                            </td>
                                                        </tr>
                                        </>
                                    );
                                }
                                return itemsArr.map((item:any, idx:number) => (
                                    <tr key={item.entry_id ?? item.id ?? idx} className="border-t">
                                        <td className="p-2 align-top">{(() => {
                                            const mappedByEmail = item.email ? eventEmailToEntryId.get(String(item.email).toLowerCase()) : null;
                                            const mappedByPhone = item.phone ? eventEmailToEntryId.get(String(item.phone)) : null;
                                            const mappedId = mappedByEmail ?? mappedByPhone ?? null;
                                            return mappedId ?? item.entry_id ?? item.id ?? item.order?.id ?? item.attendee?.id ?? 'N/A';
                                        })()}</td>
                                        <td className="p-2 align-top">{item.fullname ?? 'N/A'}</td>
                                        <td className="p-2 align-top">{item.email ?? 'N/A'}</td>
                                        <td className="p-2 align-top">{item.phone ?? 'N/A'}</td>
                                        <td className="p-2 align-top">{item.registereddate ? new Date(item.registereddate).toLocaleString() : 'N/A'}</td>
                                        <td className="p-2 align-top">{item.checkedindate ? new Date(item.checkedindate).toLocaleString() : 'N/A'}</td>
                                        <td className="p-2 align-top">
                                            <Button onClick={() => { setDetailData(item); setIsDetailModalOpen(true); }}>Check Details</Button>
                                        </td>
                                    </tr>
                                ));
                            })()}
                        </tbody>
                    </table>
                </div>

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

                {/* Detail modal for individual row */}
                {isDetailModalOpen && detailData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="relative z-50 max-w-md w-full mx-4">
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold">Attendee Details</h3>
                                        <p className="text-sm text-muted-foreground">Details for the selected attendee</p>
                                    </div>
                                    <button aria-label="Close" onClick={()=>{
                                        setIsDetailModalOpen(false);
                                    }} className="text-gray-500 hover:text-gray-700">✕</button>
                                </div>

                                <div className="mt-4 space-y-2 text-sm">
                                    <div><strong>ID:</strong> {detailData.id ?? 'N/A'}</div>
                                    <div><strong>Name:</strong> {detailData.fullname ?? 'N/A'}</div>
                                    <div><strong>Email:</strong> {detailData.email ?? 'N/A'}</div>
                                    <div><strong>Phone:</strong> {detailData.phone ?? 'N/A'}</div>
                                    <div><strong>Registered:</strong> {detailData.registereddate ? new Date(detailData.registereddate).toLocaleString() : 'N/A'}</div>
                                    <div><strong>Checked In:</strong> {detailData.checkedindate ? new Date(detailData.checkedindate).toLocaleString() : 'N/A'}</div>
                                </div>

                                <div className="mt-4 flex gap-2">
                                    <Button variant="ghost" onClick={()=>{
                                        setIsDetailModalOpen(false);
                                    }}>Close</Button>
                                </div>
                            </div>
                        </div>
                        <div className="fixed inset-0 bg-black opacity-30" onClick={()=>{
                            setIsDetailModalOpen(false);
                        }} />
                    </div>
                )}
            </div>

        </div>
    )
}

export default Index;
