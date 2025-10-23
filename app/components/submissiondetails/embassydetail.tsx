import axiosInstance from "@/lib/axiosinstance";
import { type response } from "@/types/response";
import { type EmbassySubmission } from "@/types/submission";
import { useQuery } from "@tanstack/react-query";
import type { FC } from "react";
import Loading from "@/components/loading";
import ShowFile from "@/components/showfile";

type EmbassyDetailProps = {
    entry_id:number
}
const EmbassyDetail:FC<EmbassyDetailProps> = ({entry_id})=>{
    const {data, isLoading} = useQuery({
        queryKey:['embassyc', entry_id],
        queryFn: async ()=>{
            const res = await axiosInstance.get<response<EmbassySubmission[]>>('/register/submission/embassy/'+entry_id);

            return res.data.data?.pop();
        },

    })
    const regex = /country";s:\d+:"([^"]+)";/g;
    console.log(data?.address)
    return(
        <div className="grid md:grid-cols-2 min-w-[80%]">
            {isLoading && <Loading/>}
            {!isLoading && (
                <>
            <span>Full Name: {data?.fullName}</span>
            <span>Email: {data?.email}</span>
            <span>Phone Number: {data?.phoneNo}</span>
            <span>Country: {regex.exec(data?.address || '')?.[1]}</span>
            <span>Embassy: {data?.embassy}</span>
            <ShowFile file={data?.passport} name="Passport"/>
            <span>Requested Bilateral : {data?.requestBilateral}</span>
            <span>Want to Attend Policy Meeting: {data?.attendPolicy}</span>
            <span>Has Delegation: {data?.anyDelegation}</span>
            <span>Number of Delegation: {data?.numDelegation}</span>
                </>
            )}
        </div>
    )
}

export default EmbassyDetail;
