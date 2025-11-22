import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/authprovider";
import axiosInstance from "@/lib/axiosinstance";
import { toastError } from "@/lib/toast";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Loading from "@/components/loading";
import type { AttendeeResponse } from "@/types/attendee";
import type { response } from "@/types/response";
import { useDebounce } from "@/hooks/debounce";
import { AxiosError } from "axios";

export function meta({}: any) {
  return [
    { title: "Confirmed Attendees - Future Tech Addis" },
    { name: "description", content: "Confirmed attendees" },
  ];
}

export default function ConfirmedAttendeesPage() {
  const auth = useAuth();
  const [filter, setFilter] = useState<string>("");
  const debounceSearchTerm = useDebounce(filter, 500);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["attendees", "confirmed", debounceSearchTerm],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get<response<AttendeeResponse[]>>(
          `/attendee/getAllAttendees?query=${debounceSearchTerm}`,
          {
            headers: {
              Authorization: `Bearer ${auth?.token}`,
            },
          },
        );
        return res.data;
      } catch (error) {
        if (error instanceof AxiosError) {
          toastError(error.response?.data.message || "Failed to fetch attendees");
        }
        throw error;
      }
    },
    keepPreviousData: true,
  });

  // Only include attendees that are marked as completed/confirmed or already checked in
  const filtered = data?.data?.filter(
    (a) => a.status === "COMPLETED" || a.status === "CHECKEDIN",
  );

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-2xl">Confirmed Attendees</h3>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by email, name..."
          onChange={(e) => setFilter(e.target.value)}
          value={filter}
        />
      </div>

      {isLoading && <Loading />}
      {isError && <div className="p-4 text-red-500">Error loading attendees</div>}

      {filtered && filtered.length === 0 && <p>No confirmed attendees found.</p>}

      {filtered && filtered.length > 0 && (
        <Table className="border rounded-lg shadow-sm">
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((attendee) => (
              <TableRow key={attendee.id}>
                <TableCell className="whitespace-nowrap">{attendee.id}</TableCell>
                <TableCell>{attendee.fullname}</TableCell>
                <TableCell>{attendee.email}</TableCell>
                <TableCell>{attendee.phone ?? "N/A"}</TableCell>
                <TableCell>
                  {attendee.createdAt ? new Date(attendee.createdAt).toLocaleDateString() : "N/A"}
                </TableCell>
                <TableCell>
                  {attendee.updatedAt ? new Date(attendee.updatedAt).toLocaleDateString() : "N/A"}
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    {attendee.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}