import { useAuth } from "@/components/authprovider";
import { DataTable } from "@/components/datatable";
import Loading from "@/components/loading";
import { messageColumns } from "@/components/tablecolumns/messagecolumns";
import axiosInstance from "@/lib/axiosinstance";
import type { Message } from "@/types/message";
import type{ response } from "@/types/response";
import { useQuery } from "@tanstack/react-query";
import type { MetaArgs } from "react-router";

export function meta({}:MetaArgs){
    return[
    { title: 'Messages - Future Tech Addis' },
    { name: 'description', content: 'Message sent' },
  ];
}

export function clientLoader(){

}

const Index = ()=>{
    const auth = useAuth();
    const {data, isLoading} = useQuery({
        queryKey: ['messages'],
        queryFn: async()=>{
            const res = await axiosInstance.get<response<Message[]>>('mail/messages', {
                headers:{
                    'Authorization': 'Bearer '+ auth?.token
                }
            });
            return res.data;
        }
    });
    console.log(data);
    return(
        <div>
            {isLoading && <Loading/>}
            {data?.data && <DataTable columns={messageColumns} data={data.data}/>}

        </div>
    )
}

export default Index;