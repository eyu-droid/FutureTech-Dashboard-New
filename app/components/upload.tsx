import { Import } from "lucide-react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button";
import type { FC } from "react";

type UploadFileProps = {
    children: React.ReactNode
}
export const UploadFile:FC<UploadFileProps> = ({children})=>{
    return(
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    Import
                    <Import className="w-5 h-5"/>

                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Import File</DialogTitle>
                    <DialogDescription>you can import csv and excel files</DialogDescription>
                </DialogHeader>
                <div>
                    {children}                    
                </div>
                
            </DialogContent>
        </Dialog>
    )
}

export default UploadFile;