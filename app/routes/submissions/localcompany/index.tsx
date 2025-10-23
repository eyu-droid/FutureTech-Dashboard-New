import { useAuth } from "@/components/authprovider";
import { localcompanycolumns } from "@/components/tablecolumns/localcompanycolumns";
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

export function loader() { }


const Index = () => {
    const auth = useAuth();
    const { data, isLoading } = useQuery({
        queryKey: [],
        queryFn: async () => {
            const res = await axiosInstance.get<response<SubmissionResponse[]>>('/register/submission/localcompany', {
                headers: {
                    'Authorization': 'Bearer ' + auth?.token
                }
            });
            return res.data;
        }
    });

    return (

        <SubmissionDetail columns={localcompanycolumns} data={data?.data} isLoading={isLoading} name="Local Company Submission" />

    )




}

export default Index;