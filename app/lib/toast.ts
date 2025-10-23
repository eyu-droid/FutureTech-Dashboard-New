import { toast } from "sonner"
import {XCircle} from 'lucide-react';
export const toastError = (message:string)=>{
    return toast.apply(this,[message, {position:'top-center', style:{backgroundColor: "#fb2c36", color:"#ffff"}}]);
}

export const toastSuccess = (message:string)=>{
    return toast.apply(this, [message, {position:'top-center', style:{backgroundColor: "#00C950", color:"#ffff"}}]);
}

export const toastInfo = (message:string)=>{
    return toast.apply(this, [message]);
}