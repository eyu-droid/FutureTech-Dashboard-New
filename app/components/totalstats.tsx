import { useQuery } from "@tanstack/react-query";
import StatCard from "./statcard";
import axiosInstance from "@/lib/axiosinstance";
import Loading from "./loading";
import {
    ChartColumnIncreasing,
    FormInput,
    LucideVoicemail,
    Users,
    Building2,
    CalendarDays,
} from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type FilterMode = "Participants" | "Attendees";

const TotalStat = () => {
    const [filterMode, setFilterMode] = useState<FilterMode>("Participants");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const dateParams = `${from ? `&from=${from}` : ""}${to ? `&to=${to}` : ""}`;

    const { data: participantData, isLoading: loadingParticipants } = useQuery({
        queryKey: ["stat", from, to],
        queryFn: async () => {
            const res = await axiosInstance.get(`/register/submission/stat?${dateParams}`);
            return res.data;
        },
        enabled: filterMode === "Participants",
    });

    const { data: attendeeData, isLoading: loadingAttendees } = useQuery({
        queryKey: ["attendee-stat", from, to],
        queryFn: async () => {
            const res = await axiosInstance.get(`/register/submission/attendee-stat?${dateParams}`);
            return res.data;
        },
        enabled: filterMode === "Attendees",
    });

    const isLoading = filterMode === "Participants" ? loadingParticipants : loadingAttendees;

    return (
        <>
            {/* Filter Controls */}
            <div className="flex flex-wrap items-end gap-4 my-4">
                <div className="space-y-1">
                    <Label className="text-xs text-gray-500">View</Label>
                    <Select value={filterMode} onValueChange={(v) => setFilterMode(v as FilterMode)}>
                        <SelectTrigger className="w-44">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Participants">Participants</SelectItem>
                            <SelectItem value="Attendees">Attendees</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-gray-500">From</Label>
                    <Input
                        type="date"
                        value={from}
                        max={to || undefined}
                        onChange={(e) => setFrom(e.target.value)}
                        className="w-40"
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-gray-500">To</Label>
                    <Input
                        type="date"
                        value={to}
                        min={from || undefined}
                        onChange={(e) => setTo(e.target.value)}
                        className="w-40"
                    />
                </div>
                {(from || to) && (
                    <button
                        onClick={() => { setFrom(""); setTo(""); }}
                        className="text-xs text-red-500 underline pb-1"
                    >
                        Clear dates
                    </button>
                )}
            </div>

            {isLoading && <Loading />}

            {/* Participants view */}
            {!isLoading && filterMode === "Participants" && participantData && (
                <div className="w-full grid md:grid-cols-4 sm:grid-cols-2 xs:grid-cols-1 gap-2">
                    <StatCard
                        title="Embassy"
                        changes={participantData.data.embassyChange ?? 0}
                        totalCount={participantData.data.totalEmbassySubmission}
                        icon={<ChartColumnIncreasing className="w-10 h-10 border rounded-full p-2 bg-orange-500 text-white" />}
                    />
                    <StatCard
                        title="International Company"
                        changes={participantData.data.internationCompanyChange ?? 0}
                        totalCount={participantData.data.totalInternationCompanySubmission}
                        icon={<FormInput className="w-10 h-10 border rounded-full p-2 bg-blue-500 text-white" />}
                    />
                    <StatCard
                        title="Local Company"
                        changes={participantData.data.localCompanyChange ?? 0}
                        totalCount={participantData.data.totalLocalCompanySubmission}
                        icon={<Building2 className="w-10 h-10 border rounded-full p-2 bg-green-500 text-white" />}
                    />
                    <StatCard
                        title="NGO"
                        changes={participantData.data.ngoChange ?? 0}
                        totalCount={participantData.data.totalNgoSubmission}
                        icon={<LucideVoicemail className="w-10 h-10 border rounded-full p-2 bg-purple-500 text-white" />}
                    />
                    <StatCard
                        title="Startup"
                        changes={participantData.data.startupChange ?? 0}
                        totalCount={participantData.data.totalStartupSubmission}
                        icon={<ChartColumnIncreasing className="w-10 h-10 border rounded-full p-2 bg-yellow-500 text-white" />}
                    />
                </div>
            )}

            {/* Attendees view */}
            {!isLoading && filterMode === "Attendees" && attendeeData && (
                <div className="w-full grid md:grid-cols-4 sm:grid-cols-2 xs:grid-cols-1 gap-2">
                    <StatCard
                        title="Event Attendees"
                        changes={attendeeData.data.eventChange ?? 0}
                        totalCount={attendeeData.data.totalEventAttendees}
                        icon={<CalendarDays className="w-10 h-10 border rounded-full p-2 bg-blue-500 text-white" />}
                    />
                    <StatCard
                        title="Conference Attendees"
                        changes={attendeeData.data.conferenceChange ?? 0}
                        totalCount={attendeeData.data.totalConferenceAttendees}
                        icon={<Users className="w-10 h-10 border rounded-full p-2 bg-green-500 text-white" />}
                    />
                </div>
            )}
        </>
    );
};

export default TotalStat;