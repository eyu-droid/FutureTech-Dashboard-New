import { useAuth } from "@/components/authprovider";
import SubmissionDetail from "@/components/submissiondisplay";
import axiosInstance from "@/lib/axiosinstance";
import { useQuery } from "@tanstack/react-query";
import { EventAttendeeColumns } from "@/components/tablecolumns/eventattendeecolumns";
import type { response } from "@/types/response";
import type { EventAttendeeSubmission } from "@/types/submission";
import type { MetaArgs } from "react-router";

export function meta({ }: MetaArgs) {
    return [
        { title: 'Registration Submissions - Future tech addis' },
        { name: 'description', content: 'Form submissions' }
    ]
} 
const Index = () => {
     const auth = useAuth();
    const { data, isLoading } = useQuery({
        queryKey: ['eventAttendee'],
        queryFn: async () => {
            const res = await axiosInstance.get<response<EventAttendeeSubmission[]>>('/register/submission/event', {
                headers: {
                    'Authorization': 'Bearer ' + auth?.token
                }
            });
           
            return res.data;
        }
    });
    return(
         <SubmissionDetail columns={EventAttendeeColumns} data={data?.data} isLoading={isLoading} name="Event Attendess" />
    )
}

export default Index;