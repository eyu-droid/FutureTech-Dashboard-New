import TotalStat from "@/components/totalstats";
import type { Route } from "../+types/root";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosinstance";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Future Tech Addis Dashboard" },
    { name: "description", content: "Welcome to Future Tech Event Dashboard" },
  ];
}

const COLORS = ["#f97316", "#3b82f6", "#22c55e", "#a855f7", "#eab308"];

function useStatData() {
  return useQuery({
    queryKey: ["stat-charts"],
    queryFn: async () => {
      const [participantRes, attendeeRes] = await Promise.all([
        axiosInstance.get("/register/submission/stat"),
        axiosInstance.get("/register/submission/attendee-stat"),
      ]);
      return { participants: participantRes.data.data, attendees: attendeeRes.data.data };
    },
  });
}

export default function DashboardHome() {
  const { data } = useStatData();

  const pieData = data
    ? [
      { name: "Embassy", value: data.participants.totalEmbassySubmission },
      { name: "Int'l Company", value: data.participants.totalInternationCompanySubmission },
      { name: "Local Company", value: data.participants.totalLocalCompanySubmission },
      { name: "NGO", value: data.participants.totalNgoSubmission },
      { name: "Startup", value: data.participants.totalStartupSubmission },
    ]
    : [];

  const barData = data
    ? [
      {
        name: "Participants",
        Embassy: data.participants.totalEmbassySubmission,
        "Int'l Co.": data.participants.totalInternationCompanySubmission,
        "Local Co.": data.participants.totalLocalCompanySubmission,
        NGO: data.participants.totalNgoSubmission,
        Startup: data.participants.totalStartupSubmission,
      },
    ]
    : [];

  const attendeeLineData = data
    ? [
      { name: "Event", count: data.attendees.totalEventAttendees },
      { name: "Conference", count: data.attendees.totalConferenceAttendees },
    ]
    : [];

  const totalParticipants = pieData.reduce((s, d) => s + d.value, 0);
  const totalAttendees = data
    ? data.attendees.totalEventAttendees + data.attendees.totalConferenceAttendees
    : 0;

  return (
    <div className="space-y-6 pb-10">
      <h3 className="font-semibold text-2xl">Dashboard</h3>

      <TotalStat />

      {/* Summary row */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Participants", value: totalParticipants, color: "bg-purple-50 border-purple-200" },
            { label: "Total Attendees", value: totalAttendees, color: "bg-blue-50 border-blue-200" },
            { label: "Event Attendees", value: data.attendees.totalEventAttendees, color: "bg-green-50 border-green-200" },
            { label: "Conference Attendees", value: data.attendees.totalConferenceAttendees, color: "bg-orange-50 border-orange-200" },
          ].map((item) => (
            <div key={item.label} className={`rounded-lg border p-4 ${item.color}`}>
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="text-3xl font-bold mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Participants Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Participant Types (Bar)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={[
                    { name: "Embassy", count: data.participants.totalEmbassySubmission },
                    { name: "Int'l Co.", count: data.participants.totalInternationCompanySubmission },
                    { name: "Local Co.", count: data.participants.totalLocalCompanySubmission },
                    { name: "NGO", count: data.participants.totalNgoSubmission },
                    { name: "Startup", count: data.participants.totalStartupSubmission },
                  ]}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Line Chart — Attendees */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Attendees Overview (Line)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={attendeeLineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Participants vs Attendees overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Participants vs Attendees</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={[
                    { name: "Participants", count: totalParticipants },
                    { name: "Attendees", count: totalAttendees },
                  ]}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}