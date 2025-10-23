import axiosInstance from "@/lib/axiosinstance";
import { type response } from "@/types/response";
import { type InternationalCompaniesSubmission } from "@/types/submission";
import { useQuery } from "@tanstack/react-query";
import { useState, type FC } from "react";
import Loading from "@/components/loading";
import ShowFile from "@/components/showfile";

type InternationalCompanyDetailProps = {
    entry_id:number
}
const InternationalCompanyDetail:FC<InternationalCompanyDetailProps> = ({entry_id})=>{
    const [address, setAddress] = useState('');
    const {data, isLoading} = useQuery({
        queryKey:['internationalcompany', entry_id],
        queryFn: async ()=>{
            const res = await axiosInstance.get<response<InternationalCompaniesSubmission[]>>('/register/submission/internationalcompany/'+entry_id);

            return res.data.data?.pop();
        },

    })
    const regex = /country";s:\d+:"([^"]+)";/g;

// Alternative syntax using RegExp constructor
// const regex = new RegExp('s:\\d+:"([^"]+)"', 'g')

const str = data?.address || '';

// Reset `lastIndex` if this regex is defined globally
// regex.lastIndex = 0;

let m;
m = regex.exec(str)

console.log(m && m[1])
while ((m = regex.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
        regex.lastIndex++;
    }
    
    // The result can be accessed through the `m`-variable.
    
    
}
    return(
        
        <div className="grid grid-cols-2 min-w-[80%]">
            {isLoading && <Loading/>}
            {!isLoading && (
                <>
            <span>Full Name: {data?.fullName}</span>
            <span>Company Name: {data?.companyName}</span>
            <span>Email : {data?.email}</span>
            <span>Phone Number : {data?.phoneNo}</span>
            <ShowFile file={data?.passport} name="Passport"/>
            <ShowFile file={data?.companyProfile} name="Company Profile"/>
            <ShowFile file={data?.companyWebsite} name="Company Website"/>
            <span>Address: <b>{regex.exec(data?.address || '')?.[1]}</b></span>
            <span>Registered Date : {new Date(data?.registeredDate?.toString()).toDateString()}</span>
            <span>Pitch Product : {data?.pitchProduct}</span>
            <span>Areas of Interest: {data?.areaOfInterest}</span>
            <span>Interest Type: {data?.interestType}</span>
            <span>Schedule B2B: {data?.b2Schedule}</span>
            <span>Sponsorship Tier : {data?.sponsorshipTier}</span>

                </>
            )}
        </div>
    )
}

export default InternationalCompanyDetail;
