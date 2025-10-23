import { useAuth } from "@/components/authprovider";
import { DataTable } from "@/components/datatable";
import Loading from "@/components/loading";
import { partnerColumn } from "@/components/tablecolumns/partnercolumns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UploadFile from "@/components/upload";
import UploadPartners from "@/components/uploadpartners";
import axiosInstance from "@/lib/axiosinstance";
import { useQuery } from "@tanstack/react-query";
import { Download, Upload } from "lucide-react";
import type { MetaArgs } from "react-router";

export function meta({}:MetaArgs){
    return[
        { title: 'Partners - Future Tech Addis' },
        {name: 'description', content: 'Partner page'}
    ]
}

export function clientLoader(){
}

const Index = ()=>{
    const auth = useAuth();
    const {data, isLoading} = useQuery({
        queryKey: [],
        queryFn: async ()=>{
            const res = await axiosInstance.get('partner/getallpartners', {
                headers: {
                    'Authorization':'Bearer '+auth?.token
                }
            });
            return res.data
        }
    });

    return(
        <div>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-2xl">Partners</h3>
                    <UploadFile>
                        <UploadPartners/>
                    </UploadFile>
                </div>

                {
                    isLoading && <Loading/>
                }
                {
                    data?.data && <DataTable data={data.data} columns={partnerColumn}/>
                }
            </div>
        </div>
    )


}

export default Index;