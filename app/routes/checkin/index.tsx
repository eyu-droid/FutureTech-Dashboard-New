import AttendeeTable from "@/components/attendeestable";
import Fallback from "@/components/fallback";
import HtmlQRCode from "@/components/htmlqrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/lib/axiosinstance";
import { toastError, toastSuccess } from "@/lib/toast";
import type { AttendeeResponse } from "@/types/attendee";
import type { response } from "@/types/response";
import { useMutation, useQuery } from "@tanstack/react-query";
import { QrCode } from "lucide-react";
import type { Route } from "./+types";
import type { IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { useAuth } from "@/components/authprovider";
import { AxiosError } from "axios";
import Loading from "@/components/loading";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/debounce";
import { columns } from "@/components/tablecolumns/attendeecolumns";
import { toast } from "sonner";


export function meta({}:Route.MetaArgs){
    return[
        { title: 'CheckIn - Future Tech Addis' },
        {name: 'description', content: 'Checkin page'}
    ]
}

export function clientLoader(){
    
}

export function HydrateFallback(){
    return <Fallback/>
}

const Index = ()=>{
    const auth = useAuth();
    const [filter, setFilter] = useState('');
    const debounceSearchTerm = useDebounce(filter, 500);
    const {data, isLoading, isError , refetch} = useQuery({
        queryKey: ['attendees', debounceSearchTerm],
        queryFn: async ()=>{
            const res = await axiosInstance.get<response<AttendeeResponse[]>>('attendee/getAllAttendees?query='+ filter);
            return res.data
        },
        
    })
   
    const {mutate, isPending} = useMutation({
        mutationFn: async(orderCode:string)=>{
            const res = await axiosInstance.post<response<any>>('/attendee/checkin', {orderNo:orderCode},{
                headers:{
                    'Authorization': 'Bearer '+auth?.token
                }
            });
            return res.data;
        },
        onSuccess: (data)=>{
            toastSuccess(data.message)
        },
        onError: (error)=>{
            if(error instanceof AxiosError){
                toastError(error.response?.data.message)
            }
        }
    })
    useEffect(()=>{
        if(isPending){
            toast.info('Verifing ticket',{icon:<Loading/>,cancel:!isPending, position:'top-center'})
        }
    }, [isPending])
   const onQRSuccess = (result:IDetectedBarcode[])=>{
    const orderCode = result[0].rawValue
    mutate(orderCode);
   }
   const onQRError = (error:unknown)=>{

   }
    return(
        <div>
            <div className="space-y-3">
                <h3 className="font-semibold text-2xl">Event checkin</h3>
                <div className="flex  items-center gap-2 ">
                    <Input placeholder="Search by email, Full name..." onChange={(e)=>setFilter(e.target.value)} />
                    <HtmlQRCode onQRCodeSuccess={onQRSuccess} onQRCodeError={onQRError}/>
                </div>
                {
                    isLoading && <Loading/>
                }
                {
                    data?.data && <AttendeeTable attendeeData={data?.data} columns={columns}/>
                }
            </div>

        </div>
    )
}

export default Index;