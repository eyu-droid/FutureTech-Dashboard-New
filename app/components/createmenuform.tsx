import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axiosInstance from "@/lib/axiosinstance"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useAuth } from "./authprovider"
import { type response } from "@/types/response"
import { type MenuType } from "./tablecolumns/menucolumns"
import { Button } from "./ui/button"
import Loading from "./loading"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { MenuSchema, type MenuSchemaType } from "@/types/menus"
import { toastSuccess } from "@/lib/toast"
import type { FC } from "react"
import { useMenuStore } from "store/menustore"
type CreateMenuFormProps={
    update:boolean
}
const CreateMenuForm:FC<CreateMenuFormProps> = ({update})=>{
    const auth = useAuth();
    const{menu, clearSelectedMenu,editMenu, addMenu} = useMenuStore()
    const {register, handleSubmit, formState:{errors}} = useForm({
        resolver: zodResolver(MenuSchema),
       values:{
        menuName: menu?.menuName || '',
        parent: menu?.parent.toString() || '',
        route: menu?.route || ''
       }
    })
    const {mutate, isPending} = useMutation({
        mutationFn: async(data:MenuSchemaType)=>{
            const res = await axiosInstance.post('menu/create',data,{
                headers:{
                    'Authorization': 'Bearer '+auth?.token
                }
            });
            return res.data;
        },
        onSuccess(){
            refetch()
            toastSuccess("Menu created");
        }
    })
    const {mutate:updateMenu, isPending:isUpdating} = useMutation({
        mutationFn: async(data:MenuSchemaType&{id:number})=>{
            const res = await axiosInstance.put('menu/update', data,{
                headers:{
                    'Authorization': 'Bearer '+ auth?.token
                }
            });
            return res.data
        }
    })
    const {data, isLoading, refetch} = useQuery({
        queryKey: ['menuslist'],
        queryFn: async ()=>{
            const res = await axiosInstance.get<response<MenuType[]>>('menu/getallmenus',{
                headers:{
                    "Authorization": "Bearer "+auth?.token
                }
            })
            return res.data;
        }
    });
    const onSubmit:SubmitHandler<MenuSchemaType> = (data)=>{
        if(!menu){
            addMenu(data, parseInt(data.parent) || undefined)
            console.log(data);
            mutate(data)
        }else{
            const menuUpdate = {
                id: menu.id,
                menuName: data.menuName,
                parent: data.parent,
                route: data.route,
            }
            editMenu(menu.id,menuUpdate);
            updateMenu(menuUpdate)
        }
    }
    

    return(
        <form className="w-[50%] space-y-3" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2">
                    <Label>Menu</Label>
                    <Input placeholder="Menu name" {...register('menuName')}/>
                    {errors.menuName && <span className="text-sm text-red-500">{errors.menuName.message}</span>}
                </div>
                <div className="space-y-2">
                    <Label>Route</Label>
                    <Input placeholder="Route" {...register('route')}/>
                    {errors.route && <span className="text-sm text-red-500">{errors.route.message}</span>}
                </div>
                <div className="space-y-2">
                    <div className="flex">
                        <Label htmlFor="parent">Parent</Label>
                        {isLoading && <Loading/>}
                    </div>
                    <select {...register('parent')} className="py-2 px-2 rounded-md w-full border-gray-300 outline-gray-200">
                        <option value="">Select Parent Menu</option>
                        {
                            !isLoading && data && data?.data?.map((item)=>{
                                return(
                                    <option key={item.id} value={item.id}>{item.menuName}</option>
                                )
                            })
                        }
                    </select>
                </div>
                <div className="my-4 flex gap-2">
                    <Button type="submit" disabled={isPending || isUpdating}>{menu?"Update Menu": "Add Menu"} {isPending || isUpdating && <Loading/>}</Button>
                    {menu && <Button variant="outline" onClick={()=>clearSelectedMenu()}>Clear</Button>}
                </div>
            </form>
    )
}

export default CreateMenuForm;