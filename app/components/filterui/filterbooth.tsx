import type { Column } from "@tanstack/react-table"
import { useState } from "react";
import { Checkbox } from "../ui/checkbox";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
export const BoothColumnFilter = ({ column }: { column: Column<any, unknown>})=>{
    const columnFilterValue = column.getFilterValue() as string;
    const [selectedValues, setSelectedValues] = useState<string>(columnFilterValue);
    const onSelectChange = (value:string)=>{
        console.log(value)
        setSelectedValues(value);
        if(value == 'All'){
            column.setFilterValue('')
        }else{
            column.setFilterValue(value);
        }
    }
    const options = ["All","Yes", "No"]
    return(
        <div className='flex '>
      <div className="space-y-2">
        <Label>Has Booth</Label>
                <Select onValueChange={(value)=>onSelectChange(value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Has Booth" />
                    </SelectTrigger>
                    <SelectContent className="">
                    {options.map((option)=>(
                        <SelectItem value={option}>{option}</SelectItem>
                    
                    ))}
                    
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
    
}