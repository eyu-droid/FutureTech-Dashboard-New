import QRCode from "react-qr-code";
import type { EventAttendeeSubmission } from "@/types/submission";
import type { ColumnDef } from "@tanstack/react-table";
import { BaseColumns } from "./basecolumns";
import { Button } from "../ui/button";
import { ArrowUpDown, MoreVertical } from "lucide-react";
import { DateRangeColumnFilter } from "../filterui/datefilter";
import { InterestColumnFilter } from "@/components/filterui/interestcolumnfilter";
import { useAuth } from "../authprovider";
import axiosInstance from "@/lib/axiosinstance";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "../ui/dialog";
import { DeleteConfirmationDialog } from "../DeleteConfirmationDialog";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useUserStore } from "store/userstore";
import { useState } from "react";

export const EventAttendeeColumns: ColumnDef<EventAttendeeSubmission>[] = [
    ...(BaseColumns as ColumnDef<EventAttendeeSubmission>[]),
    {
        accessorKey: 'sectorOfInterest',
        header: ({column})=>{
            return(
                <Button variant='ghost' className='cursor-pointer' onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Sector of Interest
                    <ArrowUpDown className='w-5 h-5' />
                </Button>
            )
        },
        cell: (props) => {
            // Try a few shapes: raw value, select-1 (some payloads), or fallback
            const raw = props.getValue() as string | undefined;
            const row = (props.row as any).original || {};
            const metaVal = row['select-1'] ?? row['select_1'] ?? raw ?? row.sectorOfInterest ?? row.areaOfInterest ?? 'N/A';
            return <span className="text-gray-800">{metaVal || 'N/A'}</span>
        },
        filterFn: 'interest' as any,
        meta: {
            filter: InterestColumnFilter
        }
    },
    {
        accessorKey: 'registeredDate',
        header: ({column})=>{
            return(
                <Button variant='ghost' className='cursor-pointer' onClick={()=>column.toggleSorting(column.getIsSorted() === "asc")}>
                   Registered Date
                    <ArrowUpDown className='w-5 h-5'/>
                </Button>
            )
        },
        cell: (props) => (
            <span className="text-gray-800">{new Date(props.getValue() as string).toDateString()}</span>
        ),
        filterFn: 'dateRange' as any,
        meta:{
            filter: DateRangeColumnFilter
        }
    },
    {
        accessorKey: 'ticketType',
        header: ({column})=>{
            return(
                <Button variant='ghost' className='cursor-pointer' onClick={()=>column.toggleSorting(column.getIsSorted() === "asc")}>
                    Ticket Type
                    <ArrowUpDown className='w-5 h-5'/>
                </Button>
            )
        },
        cell: (props) => {
            // Many backends return ticketType or select-2/select_2 — prefer explicit meta when present
            const raw = props.getValue() as string | undefined;
            const row = (props.row as any).original || {};
            const metaTicket = row['select-2'] ?? row['select_2'] ?? row.ticketType ?? row.ticket ?? raw ?? 'N/A';
            return <span className="text-gray-800">{metaTicket || 'N/A'}</span>
        }
    },
    {
        header: 'Actions ',
        cell: ({ row }) => {
            const auth = useAuth()
            const {user} = useUserStore();
            const queryClient = useQueryClient();
            const [open, setOpen] = useState(false); // dialog open state per-row cell renderer
            const { mutate } = useMutation({
                mutationFn: async () => {
                    const response = await axiosInstance.delete(`/register/submission/event/${row.getValue('entry_id')}`, {
                        headers: {
                            Authorization: `Bearer ${auth?.token}`
                        }
                    });
                    return response.data;
                },
                onSuccess: () => {
                    toast.success('Submission deleted successfully');
                    queryClient.invalidateQueries({ queryKey: ['submissions'] });
                },
                onError: (error) => {
                    if (error instanceof AxiosError) {
                        toast.error(error.response?.data.message);
                    }
                }
            });

            const handleDelete = () => {
                mutate();
            }

            // Determine if we should hide the print badge (when QR was already sent via email)
            const rowOriginal: any = row.original || {};
            const qrSent = Boolean(rowOriginal.qrSent || rowOriginal.qr_sent || rowOriginal.emailSent || rowOriginal.email_sent);

            // badge details
            const fullName = row.getValue('fullName') ?? rowOriginal.fullName ?? rowOriginal.fullname ?? '';
            // Prefer numeric-looking registration id (entry_id is usually numeric for submissions)
            const regIdRaw = row.getValue('entry_id') ?? rowOriginal.entry_id ?? rowOriginal.id ?? '';
            const registrationId = (!Number.isNaN(Number(regIdRaw)) && regIdRaw !== '') ? Number(regIdRaw) : regIdRaw;

            const ticketType = row.getValue('ticketType') ?? rowOriginal.ticketType ?? rowOriginal['select-2'] ?? rowOriginal['select_2'] ?? 'Event';
            const sector = row.getValue('sectorOfInterest') ?? rowOriginal['select-1'] ?? rowOriginal.sectorOfInterest ?? rowOriginal.sector ?? 'N/A';

            const printBadge = () => {
                // Open a simple dialog (already implemented below). We'll rely on window.print inside dialog content.
                setOpen(true);
            };

            const closeBadge = () => {
                setOpen(false);
            };

            return (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <MoreVertical />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {/* Print Badge menu item: only show when QR has not been sent via email */}
                            {!qrSent && <DropdownMenuItem onSelect={(e) => { e.preventDefault(); printBadge(); }}>
                                Print Badge
                            </DropdownMenuItem>}

                            {user.role === 3 && <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <DeleteConfirmationDialog onDelete={handleDelete} />
                            </DropdownMenuItem>}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Dialog that shows a printable badge for this attendee */}
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Print Badge</DialogTitle>
                            </DialogHeader>

                            <div style={{ padding: 8, textAlign: 'center' }}>
                                <div style={{ fontWeight: 700, fontSize: 18 }}>Future Tech Addis Expo</div>
                                <div style={{ fontSize: 12, color: '#555' }}>Nov 28 - Nov 30 • Addis Ababa Convention Center</div>

                                {/* QR code area: show a centered QR for the registration id */}
                                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
                                    <div style={{ background: 'white', padding: 8, borderRadius: 6, border: '1px solid #e6edf3', display: 'inline-flex' }} aria-hidden={!registrationId}>
                                        {registrationId ? <QRCode value={String(registrationId)} size={128} /> : null}
                                    </div>
                                </div>

                                <div style={{ marginTop: 12, fontSize: 16, fontWeight: 600 }}>{fullName}</div>
                                <div style={{ marginTop: 8 }}>Ticket: {ticketType}</div>
                                <div style={{ marginTop: 4 }}>Registration ID: {registrationId}</div>
                                <div style={{ marginTop: 8 }}>Event: Future Tech Addis</div>
                                <div style={{ marginTop: 4 }}>Date: Nov 28 - Nov 30</div>

                                <p style={{ marginTop: 12 }}>Please present this badge at the entrance</p>
                            </div>

                            <DialogFooter>
                                <Button onClick={() => { try { window.print(); } catch (e) { /* ignore */ } }}>Print</Button>
                                <DialogClose asChild>
                                    <Button variant="ghost" onClick={closeBadge}>Close</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </>
            )
        }
    }
]
