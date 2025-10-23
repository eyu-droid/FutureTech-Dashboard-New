import { MoreVertical } from "lucide-react"
import Loading from "./loading"
import { Badge } from "./ui/badge"
import useFollowUpStore from "store/store"
import type { FC } from "react"

type MarkAsCompletedProps = {
    entryId:number
}
const MarkAsCompleted:FC<MarkAsCompletedProps> = ({entryId})=>{
    const {followUp, getFollowUp} = useFollowUpStore();
    const currentFollowUp = getFollowUp(entryId);
    console.log(entryId)
     return(
        <>
        {
            currentFollowUp?.status==="Completed"  && <Badge variant="outline" className="bg-green-500 text-white">C</Badge>
        }
                                    
        </>
                                    
    )

}

export default MarkAsCompleted;