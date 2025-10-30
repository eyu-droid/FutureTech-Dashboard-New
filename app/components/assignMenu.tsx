import Loading from "@/components/loading";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axiosInstance from "@/lib/axiosinstance";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMenuStore } from "store/menustore";
import { useAuth } from "./authprovider";
import { useState } from "react";
import { toastError, toastSuccess } from "@/lib/toast";
const AssignMenu = () => {
    const { menus } = useMenuStore();
    const parentMenus = menus.filter((menu: any) => !menu.parent);
    const childMenus = menus.filter((menu: any) => menu.parent);
    const [error, setErrors] = useState<{ input: string, message: string }>({ input: '', message: '' });
    const [roleId, setRoleId] = useState('');
    const [menuIds, setMenuIds] = useState<any[]>([]);
    const auth = useAuth();
    const { data, isLoading } = useQuery({
        queryKey: ['roles'],
        queryFn: async () => {
            const res = await axiosInstance.get('role/getallroles', {
                headers: {
                    'Authorization': 'Bearer ' + auth?.token
                }
            });
            return res.data;
        },
    });

    const {data:rolesMenus, isLoading:isRolesMenusLoading} = useQuery({
        queryKey: ['role-menus', roleId],
        queryFn: async()=>{
            if(roleId === ''){
                return [];
            }
            const res = await axiosInstance.get(`permission/getmenubyrole/${roleId}`,{
                headers:{
                    'Authorization': 'Bearer '+auth?.token
                }
            });
            setMenuIds(res.data.data.map((d:any)=>d.id));
            return res.data.data;
        },
        enabled: roleId !== ''
    });
    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            const res = await axiosInstance.post('permission/assignmenustorole', {
                    roleId,
                    menus: menuIds
            }, {
                headers: {
                    'Authorization': 'Bearer ' + auth?.token
                }
            })
        },
        onSuccess: ()=>{
           
            toastSuccess('Menus assigned to role successfully');
        },
        onError(error, variables, context) {
            console.log('Error assigning menus to role:', error);
            toastError('Error assigning menus to role');
        },
    })
    const onCheckboxChange = (e: any, menu: any) => {
        if (e) {
            setMenuIds([...menuIds, menu])
        } else {
            console.log(menuIds.filter(f => f !== menu))
            setMenuIds(menuIds.filter(f => f !== menu))
        }
    }
    const assignMenusToRole = () => {
        if (roleId === '') {
            setErrors({ input: 'role', message: 'Role is required' });
            return;
        }
        if (menuIds.length === 0) {
            setErrors({ input: 'menus', message: 'At least one menu must be selected' });
            return;
        }
        setErrors({ input: '', message: '' });
        mutate();
        //call api to assign menus to role

    }
    console.log(menuIds)
    return (
        <div>
            <h2 className="text-lg font-semibold">Assign Menu To Role</h2>

            <div className="flex mt-10 gap-10 w-full ">
                <div className="w-full">
                    <div className="space-y-2 w-full">
                        <Label>Role</Label>
                        <Select onValueChange={(value)=>setRoleId(value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                            <SelectContent>

                                {
                                    data && data?.data?.map((role: any) => (
                                        <SelectItem value={role.id}>{role.name}</SelectItem>

                                    ))
                                }
                            </SelectContent>
                        </Select>
                    </div>
                    {error.input === 'role' && <span className="text-sm text-red-500">{error.message}</span>}
                    <div className="mt-5">
                        <button className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50" onClick={assignMenusToRole} disabled={isPending}>
                            {isPending ? 'Assigning...' : 'Assign Menus'}
                        </button>
                    </div>
                    {error.input === 'menus' && <span className="text-sm text-red-500">{error.message}</span>}
                </div>
                <div className="border w-full h-72 overflow-auto p-4">
                    <div>
                        {isRolesMenusLoading && <Loading/>}
                        {
                            !isRolesMenusLoading && menus?.map((value: any) => (
                                <div>

                                    <div className="flex gap-2 items-center">

                                        <span>{value.menuName}</span>
                                    </div>
                                    <div>
                                        {
                                            childMenus && value.children.map((child: any) => (
                                                <div className="ml-6 flex gap-2 items-center" key={child.id}>
                                                    <Checkbox  onCheckedChange={(checked) => onCheckboxChange(checked, child.id)} checked={menuIds.filter(f=>f===child.id).length == 1}/>
                                                    <span>{child.menuName}</span>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            ))

                        }

                    </div>
                </div>
            </div>
        </div>
    )
}

export default AssignMenu;