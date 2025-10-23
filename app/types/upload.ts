import { X } from "lucide-react";
import z from "zod";

const ACCEPTED_MIME= ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ACCEPTED_IMAGE_TYPES = ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
export const UploadSchema = z.object({
    file: z.instanceof(File, {message: 'Expected file'}) // Ensures the input is a File object
  .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`) // Validates file size
   .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), "Only .csv or .xsl formats are supported.") // Validates file type 
});


export type UploadType = z.infer<typeof UploadSchema>;
