import { Import } from "lucide-react";
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useMutation } from "@tanstack/react-query";
import type z from "zod";
import { UploadSchema, type UploadType } from "@/types/upload";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "sonner";
import { toastError, toastSuccess } from "@/lib/toast";
import Loading from "./loading";
import { ZodError } from "zod";
import { useState } from "react";
import { AxiosError } from "axios";


const UploadPartners = () => {
    const { mutate, isPending } = useMutation({
        mutationFn: async (data: FormData) => {
            
            const res = await axiosInstance.post('upload/partners', data, {
                headers:{
                    'Content-Type': 'multipart/form-data'
                }
            });
            return res.data
        },
        onSuccess(data, variables, context) {
            toastSuccess('file imported successfully')
        },
        onError(error, variables, context) {
            if(error instanceof AxiosError){
                console.log(error)
                toastError(error.response?.data.message);

            }
        },
    });
    const [error, setError] = useState("");
    const [fileData, setFileData] = useState<File | undefined>()
   
    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        try {
            console.log(files?.item(0), 'File')

            const isValid = UploadSchema.safeParse({file: files?.item(0)});
            console.log(isValid.error?.message, 'isValud')
            if (isValid.success) {
                setError('');
                setFileData(isValid.data.file);
            } else {
                setError(isValid.error.issues[0].message);
            }

        } catch (error) {
            console.log(error, 'isValud')
            if (error instanceof ZodError) {
                setError(error.message)
            }
        }
    }
    const onImport = () => {
        const formData = new FormData();
        if(error==="" && fileData){
            formData.append('file', fileData, fileData?.name)
            console.log(fileData)
            mutate(formData);
        }
    }
    return (
        <div className="space-y-4" id="uploadsubmit">
            {isPending && <Loading />}
            <Input type="file" className="file:bg-black/90 file:text-white file:px-2 file:rounded-md file:cursor-pointer" onChange={onFileChange} />
            {error !== "" && <span className="text-red-500">{error}</span>}
            <div className="flex justify-end">
                <Button className="self-end" onClick={onImport}>
                    Import
                    <Import className="w-5 h-5" />
                </Button>
            </div>
        </div>
    )
}

export default UploadPartners;