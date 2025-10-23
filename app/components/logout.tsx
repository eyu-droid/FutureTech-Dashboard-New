import { LogOut } from "lucide-react"
import { Button } from "./ui/button"
import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/lib/axiosinstance"
import { toastError, toastSuccess } from "@/lib/toast"
import { useNavigate } from "react-router"
import Loading from "./loading"

const Logout = ()=>{
    const navigate = useNavigate();
    const{mutate, isPending} = useMutation({
        mutationFn: async ()=>{
            const res = await axiosInstance.post('/auth/logout');
            return res.data;
        },
        onSuccess(){
            toastSuccess('Logged out');
            navigate('/login')
        },
        onError(){
            toastError('Something went wrong. Please try again!');
        }
    })
    return(
        <Button className="flex items-center justify-center bg-red-500 hover:bg-red-600 w-full" onClick={()=>mutate()}>
            <LogOut className="w-5 h-5"/>
            <span>Logout</span>
            {isPending && <Loading/>}
        </Button>
    )
}

export default Logout;