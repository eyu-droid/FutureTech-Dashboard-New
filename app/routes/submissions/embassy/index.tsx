import { useAuth } from "@/components/authprovider";
import { embassycolumns } from "@/components/tablecolumns/embassycolums";
import Fallback from "@/components/fallback";
import { columns } from "@/components/tablecolumns/submissioncolumns";
import SubmissionDetail from "@/components/submissiondisplay";
import axiosInstance from "@/lib/axiosinstance";
import type { response } from "@/types/response";
import type { SubmissionResponse } from "@/types/submission";
import { useQuery } from "@tanstack/react-query";
import type { MetaArgs } from "react-router";

export function meta({ }: MetaArgs) {
    return [
        { title: 'Registration Submissions - Future tech addis' },
        { name: 'description', content: 'Form submissions' }
    ]
}

export function loader() { 
    
}

export function HydrateFallback(){
    return <Fallback/>
}


const Index = () => {
    const auth = useAuth();
    const { data, isLoading } = useQuery({
        queryKey: [],
        queryFn: async () => {
            const res = await axiosInstance.get<response<SubmissionResponse[]>>('/register/submission/embassy', {
                headers: {
                    'Authorization': 'Bearer ' + auth?.token
                }
            });
            return res.data;
        }
    });

    return (

        <SubmissionDetail columns={embassycolumns} data={data?.data} isLoading={isLoading} name="Embassy Submissions" />

    )




}

export default Index;