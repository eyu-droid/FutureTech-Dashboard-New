import axiosInstance from "@/lib/axiosinstance";
import { type response } from "@/types/response";
import { type LocalCompanySubmission } from "@/types/submission";
import { useQuery } from "@tanstack/react-query";
import type { FC } from "react";
import Loading from "@/components/loading";
import ShowFile from "@/components/showfile";

type LocalCompanyDetailProps = {
    entry_id:number
}
const LocalCompanyDetail:FC<LocalCompanyDetailProps> = ({entry_id})=>{
    const {data, isLoading} = useQuery({
        queryKey:['localcompany', entry_id],
        queryFn: async ()=>{
          const res = await axiosInstance.get<response<LocalCompanySubmission[]>>('/register/submission/localcompany/' + entry_id)
          return res.data.data?.pop();
        },

    })
    return(
        <div className="grid md:grid-cols-2 min-w-[80%]">
            {isLoading && <Loading/>}
            {!isLoading && (
                <>
            <span>Full Name: {data?.fullName}</span>
            <span>Company Name: {data?.companyName}</span>
            <span>Email : {data?.email}</span>
            <span>Phone Number : {data?.phoneNo}</span>
            <span>Address: {data?.address}</span>
            
            <ShowFile file={data?.companyLicense} name="Company License"/>
            <ShowFile file={data?.companyProfile} name="Company Profile"/>
            <ShowFile file={data?.companyWebsite} name="Company Website"/>
            <span>Registered As : {data?.registerAs}</span>
            <span>Number of Attendee : {data?.numberOfAttendee}</span>
            <span>Registered Date : {data?.registeredDate.toString()}</span>
            <span>Directory List : {data?.directoryList}</span>
            <span>Areas of Interest: {data?.areaOfInterest}</span>
            <span>Interest : {data?.interest}</span>
            <span>Sponsorship : {data?.sponserShip}</span>

                </>
            )}
        </div>
    )
}

export default LocalCompanyDetail;
