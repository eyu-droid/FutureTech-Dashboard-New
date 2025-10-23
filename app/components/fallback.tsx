import { Loader2 } from "lucide-react"

const Fallback = ()=>{
    return(
        <div className="w-full h-full">
            <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-20 h-20 animate-spin"/>
                <span className="text-lg">Please wait</span>
            </div>
        </div>
    )
}

export default Fallback;