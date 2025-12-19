import type { ConferenceAttendeeSubmission } from "@/types/submission";
import type { ColumnDef } from "@tanstack/react-table";
import { BaseColumns } from "./basecolumns";
import { Button } from "../ui/button";
import { ArrowUpDown, MoreVertical } from "lucide-react";
import { InterestColumnFilter } from "@/components/filterui/interestcolumnfilter";
import { ProfessionColumnFilter } from "@/components/filterui/professioncolumnfilter";
import { useAuth } from "../authprovider";
import axiosInstance from "@/lib/axiosinstance";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DeleteConfirmationDialog } from "../DeleteConfirmationDialog";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useUserStore } from "store/userstore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "../ui/dialog";
import { useState } from "react";
import QRCode from "react-qr-code";

export const ConferenceAttendeeColumns: ColumnDef<ConferenceAttendeeSubmission>[] = [
    ...(BaseColumns as ColumnDef<ConferenceAttendeeSubmission>[]),
    {
        accessorKey: 'investmentOpportunity',
        header: ({ column }) => {
            return (
                <Button variant='ghost' className='cursor-pointer' onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Want Investement Opportunity
                    <ArrowUpDown className='w-5 h-5' />
                </Button>
            )
        }
    },
    {
        accessorKey: 'profession',
        //accessorFn: row => row.profession==='Other'? row.other:row.profession,
        header: ({ column, table }) => {

            return (
                <Button variant='ghost' className='cursor-pointer' onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Profession
                    <ArrowUpDown className='w-5 h-5' />
                </Button>
            )
        },
        filterFn: 'profession',
        meta: {
            filter: ProfessionColumnFilter
        }
    },
    {
        accessorKey: 'sectorOfInterest',
        header: ({ column })=>{
            return (
                <Button variant='ghost' className='cursor-pointer' onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Sector of Interest
                    <ArrowUpDown className='w-5 h-5' />
                </Button>
            )
        },
        filterFn: 'interest',
        meta: {
            filter: InterestColumnFilter
        },
        cell: (props) => {
            // Try multiple shapes: explicit column value, select-1 meta, meta_values, or fallback fields
            const raw = props.getValue() as string | undefined;
            const row = (props.row as any).original || {};
            const val = raw ?? row['select-1'] ?? row['select_1'] ?? (row.meta && row.meta['select-1']) ?? (row.meta_values && row.meta_values['select-1']) ?? row.sectorOfInterest ?? row.areaOfInterest ?? 'N/A';
            return <span className="text-gray-800">{val || 'N/A'}</span>;
        }
    },
    {
        accessorKey: 'workshop',
        header: ({ column })=>{
            return(
                <Button variant='ghost' className='cursor-pointer' onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Attend Workshop
                    <ArrowUpDown className='w-5 h-5' />
                </Button>
            )
        }
    },
    {
        accessorKey: 'ticketType',
        header: ({ column })=>{
            return(
                <Button variant='ghost' className='cursor-pointer' onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Ticket Type
                    <ArrowUpDown className='w-5 h-5' />
                </Button>
            )
        },
        cell: (props) => {
            // prefer explicit ticketType, then select-2 meta shapes, then ticket/ticketType on row
            const raw = props.getValue() as string | undefined;
            const row = (props.row as any).original || {};
            const val = raw ?? row['select-2'] ?? row['select_2'] ?? (row.meta && row.meta['select-2']) ?? (row.meta_values && row.meta_values['select-2']) ?? row.ticketType ?? row.ticket ?? 'N/A';
            return <span className="text-gray-800">{val || 'N/A'}</span>;
        }
    },
    {
        header: 'Actions ',
        cell: ({ row }) => {
            const auth = useAuth()
            const {user} = useUserStore();
            const queryClient = useQueryClient();
            const [open, setOpen] = useState(false);
            const { mutate } = useMutation({
                mutationFn: async () => {
                    const response = await axiosInstance.delete(`/register/submission/conference/${row.getValue('entry_id')}`, {
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

            // original row payload
            const orig: any = row.original || {};
            // detect whether a QR was already emailed / QR sent flag - tolerate several key names
            const qrSent = Boolean(orig.qrSent || orig.qr_sent || orig.qrcode_sent || orig.emailSent || orig.email_sent || orig.sent);

            // badge details (prefer values present on row, then meta shapes)
            const fullName = row.getValue('fullName') ?? orig.fullName ?? orig.fullname ?? orig.name ?? '';
            const regRaw = row.getValue('entry_id') ?? orig.entry_id ?? orig.id ?? '';
            const registrationId = (!Number.isNaN(Number(regRaw)) && regRaw !== '') ? Number(regRaw) : regRaw;
            const ticketType = row.getValue('ticketType') ?? orig.ticketType ?? orig['select-2'] ?? orig['select_2'] ?? 'Event';
            const sector = row.getValue('sectorOfInterest') ?? orig['select-1'] ?? orig['select_1'] ?? orig.sectorOfInterest ?? orig.sector ?? 'N/A';

            const openBadge = () => setOpen(true);
            const closeBadge = () => setOpen(false);
            const handlePrint = () => {
                const printUrl = `/print-qr/${encodeURIComponent(String(regRaw))}?name=${encodeURIComponent(String(fullName))}&ticket=${encodeURIComponent(String(ticketType))}`;
                try { window.open(printUrl, '_blank'); } catch (e) { window.location.href = printUrl; }
            }

            return (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <MoreVertical />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {/* Print Badge: show only when QR wasn't already emailed */}
                            {!qrSent && <DropdownMenuItem onSelect={(e) => { e.preventDefault(); openBadge(); }}>
                                Print Badge
                            </DropdownMenuItem>}

                           {user.role === 3 && <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <DeleteConfirmationDialog onDelete={handleDelete} />
                            </DropdownMenuItem>}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Future Tech Addis Expo</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-2 text-sm" style={{ padding: 8, textAlign: 'center' }}>
                                <div>Nov 28 - Nov 30 • Addis Ababa Convention Center</div>

                                {/* QR code area: centered, with a small white background box to avoid printing artifacts */}
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                                    <div style={{ background: 'white', padding: 8, borderRadius: 6, border: '1px solid #e6edf3', display: 'inline-flex' }} aria-hidden={!registrationId}>
                                        {registrationId ? <QRCode value={String(registrationId)} size={150} /> : null}
                                    </div>
                                </div>

                                <div className="text-lg font-semibold">{fullName}</div>
                                <div>Ticket: {ticketType}</div>
                                <div>Registration ID: {registrationId}</div>
                                <div>Event: Future Tech Addis</div>
                                <div>Date: Nov 28 - Nov 30</div>
                                <div>Please present this badge at the entrance</div>
                            </div>

                            <DialogFooter>
                                <Button onClick={handlePrint}>Print</Button>
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
