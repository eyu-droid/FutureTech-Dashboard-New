import AssignMenu from "@/components/assignMenu";
import { useAuth } from "@/components/authprovider";
import CreateMenuForm from "@/components/createmenuform";
import { ListMenus } from "@/components/listmenus";

import axiosInstance from "@/lib/axiosinstance";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useMenuStore } from "store/menustore";

const Index = ()=>{
    const auth = useAuth();
    const{initialState} = useMenuStore()
    const{data, isLoading} = useQuery({
        queryKey: ['structure'],
        queryFn: async()=>{
            const res = await axiosInstance.get('menu/getmenustructure',{
                headers:{
                    'Authorization': 'Bearer '+auth?.token
                }
            });
            initialState(res.data.data);
            return res.data;
        }
    })
    console.log(data)
    return(
        <div className="w-full">
            <h1 className="text-2xl font-semibold">Create Menu</h1>
            <div className="flex md:flex-row  flex-col-reverse gap-5 w-full my-10">
                <CreateMenuForm update={false}/>
                <ListMenus/>
            </div>
            <AssignMenu/>
        </div>
    )
}

export default Index;