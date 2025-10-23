import { useAuth } from "@/components/authprovider"
import { ConferenceAttendeeColumns } from "@/components/tablecolumns/conferenceattendeecolumns";
import SubmissionDetail from "@/components/submissiondisplay";
import axiosInstance from "@/lib/axiosinstance";
import type { response } from "@/types/response";
import type { ConferenceAttendeeSubmission } from "@/types/submission";
import { useQuery } from "@tanstack/react-query";
import type { MetaArgs } from "react-router";

export function meta({ }: MetaArgs) {
    return [
        { title: 'Registration Submissions - Future tech addis' },
        { name: 'description', content: 'Form submissions' }
    ]
}
const Index = () =>{
    const auth = useAuth();
    const { data, isLoading } = useQuery({
        queryKey: ['eventAttendee'],
        queryFn: async () => {
            const res = await axiosInstance.get<response<ConferenceAttendeeSubmission[]>>('/register/submission/conference', {
                headers: {
                    'Authorization': 'Bearer ' + auth?.token
                }
            });
           
            return res.data;
        }
    });
    return(
         <SubmissionDetail columns={ConferenceAttendeeColumns} data={data?.data} isLoading={isLoading} name="Conference Attendess" />
    )
}

export default Index;