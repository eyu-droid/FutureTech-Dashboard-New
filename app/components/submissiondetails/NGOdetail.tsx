import axiosInstance from "@/lib/axiosinstance";
import { type response } from "@/types/response";
import { type NGOSubmission } from "@/types/submission";
import { useQuery } from "@tanstack/react-query";
import type { FC } from "react";
import Loading from "@/components/loading";
import ShowFile from "@/components/showfile";

type NGODetailProps = {
    entry_id:number
}
const NGODetail:FC<NGODetailProps> = ({entry_id})=>{
    const {data, isLoading} = useQuery({
        queryKey:['ngo', entry_id],
        queryFn: async ()=>{
            const res = await axiosInstance.get<response<NGOSubmission[]>>('/register/submission/ngo/'+entry_id);

            return res.data.data?.pop();
        },

    })
    return(
        <div className="grid md:grid-cols-2 min-w-[80%]">
            {isLoading && <Loading/>}
            {!isLoading && (
                <>
            <span>Organization Name : {data?.orgName}</span>
            <span>Full Name : {data?.fullName}</span>
            <span>Email : {data?.email}</span>
            <span>Phone Number : {data?.phoneNo}</span>
            <span>Mission : {data?.mission}</span>
            <ShowFile file={data?.orgFile || ''} name="Organization Profile"/>
            <span>Registered Date : {data?.registeredDate.toString()}</span>
            <span>Collaboration : {data?.collaborate}</span>
            <span>Speak Request : {data?.requestSpeaking}</span>

                </>
            )}
        </div>
    )
}

export default NGODetail;
