import { File } from "lucide-react"
import type { FC } from "react";

type ShowFileProps = {
    file: string;
    name:string
}
const ShowFile:FC<ShowFileProps> = ({file, name})=>{
    let url = [];
    try{
        const urlRegex = /https?:\/\/[^\s"]+/g;
        url = file.match(urlRegex) || [];
    }catch(err){
        return <span>No file</span>
    }
    
    return(
        <div className="flex items-center gap-2  ">
            <span>{name}:</span>
            <div className="flex items-center gap-2 text-blue-500 hover:underline cursor-pointer hover:text-blue-300">
            <File className="w-5 h-5"/>
            <a href={url?.[0]} target="_blank">View</a>

            </div>
        </div>
    )

}

export default ShowFile;