import { useQuery } from "@tanstack/react-query";
import StatCard from "./statcard"
import axiosInstance from "@/lib/axiosinstance";
import Loading from "./loading";
import { ChartColumnIncreasing, FormInput, LucideVoicemail } from "lucide-react";

const TotalStat = ()=>{
    const {data, isLoading} = useQuery({
        queryKey:['stat'],
        queryFn: async ()=>{
            const res = await axiosInstance.get('/register/submission/stat');
            return res.data;
        }
    })
    return(
        <>
        {isLoading && <Loading/>}
        {data && <div className="w-full grid md:grid-cols-4 sm:grid-cols-2 xs:grid-cols-1  gap-2">
                <StatCard title="Embassy" changes={data.data.embassyChange} totalCount={data.data.totalEmbassySubmission} icon={<ChartColumnIncreasing className="w-10 h-10 border rounded-full p-2 bg-orange-500 text-white"/>}/>
                <StatCard title="International Company" changes={data.data.internationCompanyChange} totalCount={data.data.totalInternationCompanySubmission} icon={<FormInput className="w-10 h-10 border rounded-full p-2 bg-blue-500 text-white"/>}/>
                <StatCard title="Local Company" changes={data.data.localCompanyChange} totalCount={data.data.totalLocalCompanySubmission} icon={<LucideVoicemail className="w-10 h-10 border rounded-full p-2 bg-green-500 text-white"/>}/>
                <StatCard title="NGO" changes={data.data.ngoChange} totalCount={data.data.totalNgoSubmission} icon={<LucideVoicemail className="w-10 h-10 border rounded-full p-2 bg-green-500 text-white"/>}/>
                <StatCard title="Startup" changes={data.data.startupChange} totalCount={data.data.totalStartupSubmission} icon={<LucideVoicemail className="w-10 h-10 border rounded-full p-2 bg-green-500 text-white"/>}/>
            </div>}
            
        </>
    )
}

export default TotalStat;