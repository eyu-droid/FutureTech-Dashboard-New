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
import exportToExcel from "@/hooks/useExport";
import { Download } from 'lucide-react';
import type { MetaArgs } from "react-router";
import { useUserStore } from "store/userstore";



export function meta({ }: MetaArgs) {
    return [
        { title: 'CheckIn - Future Tech Addis' },
        { name: 'description', content: 'Checkin page' }
    ]
}

export function loader() { }

export function clientLoader() {

}

export function HydrateFallback() {
    return <Fallback />
}

// Stage Usher role ID
const STAGE_USHER_ROLE_ID = 27;

const Index = () => {
    const auth = useAuth();
    const { user } = useUserStore();
    const isStageUsher = user?.role === STAGE_USHER_ROLE_ID;
    const [filter, setFilter] = useState('');
    const debounceSearchTerm = useDebounce(filter, 500);
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['confirmedList', debounceSearchTerm],
        queryFn: async () => {
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
    const [isScannerOpen, setIsScannerOpen] = useState(false);
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

    const { mutate, isPending } = useMutation({
        mutationFn: async (orderCode: string) => {
            const res = await axiosInstance.post<response<any>>('/attendee/checkin', { orderNo: orderCode }, {
                headers: {
                    'Authorization': 'Bearer ' + auth?.token
                }
            });
            return res.data;
        },
        onSuccess: (data) => {
            // Show a single, appropriate toast and avoid duplicate toasts for the 'already' case.
            // Use a less-intrusive info toast for 'Already checked in' and the regular success toast for first-time check-in.
            if (data && data.message) {
                if (data.message === 'Already checked in') {
                    // less prominent message when someone was already checked
                    toast.info(data.message, { position: 'top-center' });
                } else {
                    toastSuccess(data.message);
                }
            }
            // If backend returned order and attendee, show modal with details and refresh the attendees list
            // For Stage Usher, only show toast - no modal or table refresh
            if (data && data.data && !isStageUsher) {
                setCheckedInData(data.data);
                setShowDetails(false);
                setIsCheckinModalOpen(true);
                // Refresh the confirmed list immediately so the table reflects the newly checked-in row
                try { refetch(); } catch (e) { /* ignore */ }
            }
        },
        onError: (error) => {
            if (error instanceof AxiosError) {
                toastError(error.response?.data.message)
            }
        }
    })
    useEffect(() => {
        if (isPending) {
            toast.info('Verifing ticket', { icon: <Loading />, cancel: !isPending, position: 'top-center' })
        }
    }, [isPending])

    // Export functionality
    const { mutate: exportMutate, isPending: isExporting } = exportToExcel('checkin', 'checked_in_users');
    const handleExport = () => {
        exportMutate();
    }

    const onQRSuccess = (result: IDetectedBarcode[]) => {
        const orderCode = result[0].rawValue;
        // Close scanner immediately after successful scan (except for Stage Usher)
        if (!isStageUsher) {
            setIsScannerOpen(false);
        }
        mutate(orderCode);
    }
    const onQRError = (error: unknown) => {

    }
    return (
        <div>
            <div className="space-y-3">
                <div className="flex justify-between items-center flex-wrap">
                    <h3 className="font-semibold text-2xl">Event checkin</h3>
                    {!isStageUsher && (
                        <Button onClick={handleExport} disabled={isExporting}>
                            Export {isExporting ? <Loading /> : <Download className="w-5 h-5" />}
                        </Button>
                    )}
                </div>
                <div className="flex  items-center gap-2 ">
                    {!isStageUsher && (
                        <Input placeholder="Search by email, Full name..." onChange={(e) => setFilter(e.target.value)} />
                    )}
                    <HtmlQRCode onQRCodeSuccess={onQRSuccess} onQRCodeError={onQRError} open={isScannerOpen} onOpenChange={setIsScannerOpen} />
                </div>
                {
                    isLoading && <Loading />
                }
                {/* Render the check-in list returned by the new API.
                    The API returns a payload with .data.items and pagination meta.
                    Always render the table and show a message when there are no items.
                    Hide the table completely for Stage Usher role. */}
                {!isStageUsher && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm table-auto border-collapse">
                            <thead>
                                <tr className="text-left">
                                    <th className="p-2">ID</th>
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
                                    return itemsArr.map((item: any, idx: number) => (
                                        <tr key={item.entry_id ?? item.id ?? idx} className="border-t">
                                            <td className="p-2 align-top">{(() => {
                                                const mappedByEmail = item.email ? eventEmailToEntryId.get(String(item.email).toLowerCase()) : null;
                                                const mappedByPhone = item.phone ? eventEmailToEntryId.get(String(item.phone)) : null;
                                                const mappedId = mappedByEmail ?? mappedByPhone ?? null;
                                                // prefer numeric-looking mapped id
                                                if (mappedId !== null) {
                                                    const n = typeof mappedId === 'number' ? mappedId : parseInt(String(mappedId), 10);
                                                    if (!Number.isNaN(n)) return n;
                                                    return mappedId;
                                                }
                                                // try entry_id / id if numeric
                                                if (item.entry_id && !isNaN(Number(item.entry_id))) return Number(item.entry_id);
                                                if (item.id && !isNaN(Number(item.id))) return Number(item.id);
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
                )}

                {/* Simple modal shown after a successful check-in (from QR scan or manual entry) */}
                {isCheckinModalOpen && checkedInData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="relative z-50 max-w-md w-full mx-4">
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold">{(() => {
                                            const tk = (checkedInData.order?.ticket || checkedInData.order?.ticketType || checkedInData.attendee?.submissionType || '').toString().toLowerCase();
                                            if (tk.includes('conference')) return 'Conference';
                                            if (tk.includes('event')) return 'Event';
                                            return 'Attendee';
                                        })()}</h3>
                                        <p className="text-sm text-muted-foreground">Ticket verified successfully</p>
                                    </div>
                                    <button aria-label="Close" onClick={() => {
                                        setIsCheckinModalOpen(false);
                                        try { refetch(); } catch (e) { /* ignore */ }
                                    }} className="text-gray-500 hover:text-gray-700">✕</button>
                                </div>

                                <div className="mt-4 space-y-2 text-sm">
                                    {(() => {
                                        // helper to read meta values from many shapes the backend may return
                                        const getMeta = (obj: any, key: string) => {
                                            if (!obj) return undefined;
                                            // common nested shapes
                                            if (obj.meta && obj.meta[key] !== undefined) return obj.meta[key];
                                            if (obj.meta_values && obj.meta_values[key] !== undefined) return obj.meta_values[key];
                                            // direct keys, both dashed and underscored
                                            if (obj[key] !== undefined) return obj[key];
                                            if (obj[key.replace('-', '_')] !== undefined) return obj[key.replace('-', '_')];
                                            // sometimes stored under a top-level data object
                                            if (obj.data && obj.data[key] !== undefined) return obj.data[key];
                                            return undefined;
                                        };

                                        // convenience: try attendee, order, then top-level object for a meta key
                                        const readFromShapes = (key: string) => {
                                            const shapes = [checkedInData?.attendee, checkedInData?.order, checkedInData];
                                            for (const s of shapes) {
                                                const v = getMeta(s || {}, key);
                                                if (v !== undefined && v !== null && String(v).trim() !== '') return v;
                                            }
                                            return undefined;
                                        };

                                        // ticket detection: prefer explicit select meta, then ticket/ticketType fields
                                        const ticketFromMeta = readFromShapes('select-2') ?? readFromShapes('select_2') ?? readFromShapes('select-3') ?? readFromShapes('select-1') ?? readFromShapes('select_1');
                                        const ticketType = String(ticketFromMeta ?? readFromShapes('ticket') ?? readFromShapes('ticketType') ?? checkedInData?.order?.ticket ?? checkedInData?.order?.ticketType ?? 'N/A');
                                        const tk = ticketType.toLowerCase();

                                        // sector detection across shapes (select-1, sector fields, other fallbacks)
                                        const sector = String(readFromShapes('select-1') ?? readFromShapes('select_1') ?? readFromShapes('sectorOfInterest') ?? readFromShapes('areaInterest') ?? readFromShapes('sector') ?? readFromShapes('other') ?? 'N/A');

                                        // other attendee-specific fields; try all shapes
                                        const profession = String(readFromShapes('profession') ?? readFromShapes('position') ?? readFromShapes('job') ?? 'N/A');
                                        const investment = String(readFromShapes('investmentOpportunity') ?? readFromShapes('investment') ?? readFromShapes('wantInvestment') ?? 'N/A');
                                        const workshop = String(readFromShapes('radio-3') ?? readFromShapes('workshop') ?? readFromShapes('attendWorkshop') ?? 'N/A');

                                        // registered / checked-in times: check attendee then top-level
                                        const registered = (checkedInData?.attendee && checkedInData.attendee.createdAt) ? new Date(checkedInData.attendee.createdAt).toLocaleString() :
                                            (checkedInData?.attendee && checkedInData.attendee.registereddate) ? new Date(checkedInData.attendee.registereddate).toLocaleString() :
                                                (checkedInData?.registereddate) ? new Date(checkedInData.registereddate).toLocaleString() :
                                                    'N/A';

                                        const checkedInRaw = checkedInData?.checkedInDate ?? checkedInData?.order?.checkedindate ?? checkedInData?.attendee?.checkedindate ?? checkedInData?.attendee?.checkedInAt ?? checkedInData?.checkedindate ?? null;
                                        const checkedIn = checkedInRaw ? (isNaN(Date.parse(String(checkedInRaw))) ? checkedInRaw : new Date(String(checkedInRaw)).toLocaleString()) : 'N/A';

                                        // compute numeric ID: prefer mapping by email/phone (event submissions map)
                                        const mappedByEmail = checkedInData.attendee?.email ? eventEmailToEntryId.get(String(checkedInData.attendee.email).toLowerCase()) : null;
                                        const mappedByPhone = checkedInData.attendee?.phone ? eventEmailToEntryId.get(String(checkedInData.attendee.phone)) : null;
                                        const mappedId = mappedByEmail ?? mappedByPhone ?? null;
                                        let displayId: any = 'N/A';
                                        if (mappedId !== null) {
                                            const n = typeof mappedId === 'number' ? mappedId : parseInt(String(mappedId), 10);
                                            displayId = !Number.isNaN(n) ? n : mappedId;
                                        } else if (checkedInData.attendee?.id && !isNaN(Number(checkedInData.attendee.id))) {
                                            displayId = Number(checkedInData.attendee.id);
                                        } else if (checkedInData.order?.entry_id && !isNaN(Number(checkedInData.order.entry_id))) {
                                            displayId = Number(checkedInData.order.entry_id);
                                        } else {
                                            displayId = checkedInData.attendee?.id ?? checkedInData.order?.id ?? checkedInData.order?.entry_id ?? 'N/A';
                                        }

                                        if (tk.includes('conference')) {
                                            return (
                                                <>
                                                    <div><strong>ID:</strong> {displayId}</div>
                                                    <div><strong>Full Name:</strong> {checkedInData.attendee?.fullname ?? checkedInData.attendee?.fullName ?? 'N/A'}</div>
                                                    <div><strong>Email:</strong> {checkedInData.attendee?.email ?? 'N/A'}</div>
                                                    <div><strong>Phone Number:</strong> {checkedInData.attendee?.phone ?? checkedInData.attendee?.phoneNo ?? 'N/A'}</div>
                                                    <div><strong>Want Investment Opportunity:</strong> {investment}</div>
                                                    <div><strong>Profession:</strong> {profession}</div>
                                                    <div><strong>Sector of Interest:</strong> {sector}</div>
                                                    <div><strong>Attend Workshop:</strong> {workshop}</div>
                                                    <div><strong>Ticket Type:</strong> {ticketType}</div>
                                                    <div><strong>Registered Date:</strong> {registered}</div>
                                                    <div><strong>Checked in Date:</strong> {checkedIn !== 'N/A' ? (isNaN(Date.parse(String(checkedIn))) ? checkedIn : new Date(checkedIn).toLocaleString()) : 'N/A'}</div>
                                                </>
                                            )
                                        }

                                        // default to Event view
                                        return (
                                            <>
                                                <div><strong>ID:</strong> {displayId}</div>
                                                <div><strong>Full Name:</strong> {checkedInData.attendee?.fullname ?? checkedInData.attendee?.fullName ?? 'N/A'}</div>
                                                <div><strong>Email:</strong> {checkedInData.attendee?.email ?? 'N/A'}</div>
                                                <div><strong>Phone:</strong> {checkedInData.attendee?.phone ?? checkedInData.attendee?.phoneNo ?? 'N/A'}</div>
                                                <div><strong>Sector of Interest:</strong> {sector}</div>
                                                <div><strong>Registered Date:</strong> {registered}</div>
                                                <div><strong>Checked in Date:</strong> {checkedIn !== 'N/A' ? (isNaN(Date.parse(String(checkedIn))) ? checkedIn : new Date(checkedIn).toLocaleString()) : 'N/A'}</div>
                                                <div><strong>Ticket Type:</strong> {ticketType}</div>
                                            </>
                                        )
                                    })()}
                                </div>

                                <div className="mt-4 flex gap-2">
                                    <Button variant="ghost" onClick={() => {
                                        setIsCheckinModalOpen(false);
                                        try { refetch(); } catch (e) { /* ignore */ }
                                    }}>Close</Button>
                                </div>
                            </div>
                        </div>
                        <div className="fixed inset-0 bg-black opacity-30" onClick={() => {
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
                                        <h3 className="text-lg font-semibold">{(() => {
                                            const tk = (detailData.ticketType || detailData.ticket || detailData.type || detailData.order?.ticket || detailData.order?.ticketType || detailData.submissionType || '').toString().toLowerCase();
                                            if (tk.includes('conference')) return 'Conference';
                                            if (tk.includes('event')) return 'Event';
                                            return 'Attendee';
                                        })()}</h3>
                                        <p className="text-sm text-muted-foreground">Details for the selected attendee</p>
                                    </div>
                                    <button aria-label="Close" onClick={() => {
                                        setIsDetailModalOpen(false);
                                    }} className="text-gray-500 hover:text-gray-700">✕</button>
                                </div>

                                <div className="mt-4 space-y-2 text-sm">
                                    {(() => {
                                        // helper to read meta values from many shapes the backend may return
                                        const getMeta = (obj: any, key: string) => {
                                            if (!obj) return undefined;
                                            if (obj.meta && obj.meta[key] !== undefined) return obj.meta[key];
                                            if (obj.meta_values && obj.meta_values[key] !== undefined) return obj.meta_values[key];
                                            if (obj[key] !== undefined) return obj[key];
                                            if (obj[key.replace('-', '_')] !== undefined) return obj[key.replace('-', '_')];
                                            if (obj.data && obj.data[key] !== undefined) return obj.data[key];
                                            return undefined;
                                        };

                                        // try detailData itself, detailData.attendee and detailData.order
                                        const readFromShapes = (key: string) => {
                                            const shapes = [detailData?.attendee, detailData?.order, detailData];
                                            for (const s of shapes) {
                                                const v = getMeta(s || {}, key);
                                                if (v !== undefined && v !== null && String(v).trim() !== '') return v;
                                            }
                                            return undefined;
                                        };

                                        const ticketFromMeta = readFromShapes('select-2') ?? readFromShapes('select_2') ?? readFromShapes('select-3') ?? readFromShapes('select-1');
                                        const ticketType = String(ticketFromMeta ?? readFromShapes('ticket') ?? readFromShapes('ticketType') ?? detailData?.ticketType ?? detailData?.ticket ?? 'N/A');
                                        const tk = ticketType.toLowerCase();

                                        const sector = String(readFromShapes('select-1') ?? readFromShapes('select_1') ?? readFromShapes('sectorOfInterest') ?? readFromShapes('areaInterest') ?? readFromShapes('sector') ?? readFromShapes('other') ?? 'N/A');
                                        const profession = String(readFromShapes('profession') ?? readFromShapes('position') ?? readFromShapes('job') ?? detailData?.profession ?? 'N/A');
                                        const investment = String(readFromShapes('investmentOpportunity') ?? readFromShapes('investment') ?? readFromShapes('wantInvestment') ?? detailData?.investmentOpportunity ?? 'N/A');
                                        const workshop = String(readFromShapes('radio-3') ?? readFromShapes('workshop') ?? readFromShapes('attendWorkshop') ?? detailData?.workshop ?? 'N/A');

                                        const registered = detailData?.registereddate ? new Date(detailData.registereddate).toLocaleString() : (detailData?.createdAt ? new Date(detailData.createdAt).toLocaleString() : 'N/A');

                                        const checkedInRaw = detailData?.checkedindate ?? detailData?.checkedInDate ?? detailData?.order?.checkedindate ?? null;
                                        const checkedIn = checkedInRaw ? (isNaN(Date.parse(String(checkedInRaw))) ? checkedInRaw : new Date(String(checkedInRaw)).toLocaleString()) : 'N/A';

                                        // compute numeric ID preferring event submission mapping
                                        const mappedByEmail = detailData.email ? eventEmailToEntryId.get(String(detailData.email).toLowerCase()) : null;
                                        const mappedByPhone = detailData.phone ? eventEmailToEntryId.get(String(detailData.phone)) : null;
                                        const mappedId = mappedByEmail ?? mappedByPhone ?? null;
                                        let displayId: any = 'N/A';
                                        if (mappedId !== null) {
                                            const n = typeof mappedId === 'number' ? mappedId : parseInt(String(mappedId), 10);
                                            displayId = !Number.isNaN(n) ? n : mappedId;
                                        } else if (detailData.entry_id && !isNaN(Number(detailData.entry_id))) {
                                            displayId = Number(detailData.entry_id);
                                        } else if (detailData.id && !isNaN(Number(detailData.id))) {
                                            displayId = Number(detailData.id);
                                        } else {
                                            displayId = detailData.entry_id ?? detailData.id ?? detailData.order?.id ?? 'N/A';
                                        }

                                        if (tk.includes('conference')) {
                                            return (
                                                <>
                                                    <div><strong>ID:</strong> {displayId}</div>
                                                    <div><strong>Full Name:</strong> {detailData.fullname ?? detailData.fullName ?? 'N/A'}</div>
                                                    <div><strong>Email:</strong> {detailData.email ?? 'N/A'}</div>
                                                    <div><strong>Phone Number:</strong> {detailData.phone ?? detailData.phoneNo ?? 'N/A'}</div>
                                                    <div><strong>Want Investment Opportunity:</strong> {investment}</div>
                                                    <div><strong>Profession:</strong> {profession}</div>
                                                    <div><strong>Sector of Interest:</strong> {sector}</div>
                                                    <div><strong>Attend Workshop:</strong> {workshop}</div>
                                                    <div><strong>Ticket Type:</strong> {ticketType}</div>
                                                    <div><strong>Registered Date:</strong> {registered}</div>
                                                    <div><strong>Checked in Date:</strong> {checkedIn !== 'N/A' ? (isNaN(Date.parse(String(checkedIn))) ? checkedIn : new Date(checkedIn).toLocaleString()) : 'N/A'}</div>
                                                </>
                                            )
                                        }

                                        // default to Event view
                                        return (
                                            <>
                                                <div><strong>ID:</strong> {displayId}</div>
                                                <div><strong>Full Name:</strong> {detailData.fullname ?? detailData.fullName ?? 'N/A'}</div>
                                                <div><strong>Email:</strong> {detailData.email ?? 'N/A'}</div>
                                                <div><strong>Phone:</strong> {detailData.phone ?? detailData.phoneNo ?? 'N/A'}</div>
                                                <div><strong>Sector of Interest:</strong> {sector}</div>
                                                <div><strong>Registered Date:</strong> {registered}</div>
                                                <div><strong>Checked in Date:</strong> {checkedIn !== 'N/A' ? (isNaN(Date.parse(String(checkedIn))) ? checkedIn : new Date(checkedIn).toLocaleString()) : 'N/A'}</div>
                                                <div><strong>Ticket Type:</strong> {ticketType}</div>
                                            </>
                                        )
                                    })()}
                                </div>

                                <div className="mt-4 flex gap-2">
                                    <Button variant="ghost" onClick={() => {
                                        setIsDetailModalOpen(false);
                                    }}>Close</Button>
                                </div>
                            </div>
                        </div>
                        <div className="fixed inset-0 bg-black opacity-30" onClick={() => {
                            setIsDetailModalOpen(false);
                        }} />
                    </div>
                )}
            </div>

        </div>
    )
}

export default Index;
