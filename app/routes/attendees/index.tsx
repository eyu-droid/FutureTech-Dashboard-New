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
import type { Route } from "./+types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Attendees - Future Tech Addis" },
    { name: "description", content: "Attendees page" },
  ];
}

export default function AttendeesPage() {
  const auth = useAuth();
  const [filter, setFilter] = useState<string>("");
  const debounceSearchTerm = useDebounce(filter, 500);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["attendees", debounceSearchTerm],
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
          toastError(
            error.response?.data.message || "Failed to fetch attendees",
          );
        }
        throw error;
      }
    },
  });

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-2xl">Attendees</h3>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by email, name..."
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      {isLoading && <Loading />}
      {isError && (
        <div className="p-4 text-red-500">Error loading attendees</div>
      )}
      {data?.data && data.data.length === 0 && <p>No attendees found.</p>}
      {data?.data && data.data.length > 0 && (
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
            {data.data.map((attendee) => (
              <TableRow key={attendee.id}>
                <TableCell>{attendee.id}</TableCell>
                <TableCell>{attendee.fullname}</TableCell>
                <TableCell>{attendee.email}</TableCell>
                <TableCell>{attendee.phone ?? "N/A"}</TableCell>
                <TableCell>
                  {new Date(attendee.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(attendee.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      attendee.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
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
