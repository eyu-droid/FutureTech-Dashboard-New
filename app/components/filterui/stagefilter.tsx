import type { Column } from "@tanstack/react-table"
import { useState } from "react";
import { Checkbox } from "../ui/checkbox";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
export const StageColumnFilter = ({ column }: { column: Column<any, unknown>})=>{
    const columnFilterValue = column.getFilterValue() ?? "";
    const [selectedValues, setSelectedValues] = useState<string[]>(Array.isArray(columnFilterValue) ? columnFilterValue : []);
    const onCheckboxChange = (e: CheckedState, option:string)=>{
        let newSelectedValues = [...selectedValues];
        if(e){
           
            newSelectedValues.push(option);
        }else{
            
            newSelectedValues = newSelectedValues.filter((v)=>v !== option);
        }
        setSelectedValues(newSelectedValues);
        column.setFilterValue(newSelectedValues.length ? newSelectedValues : undefined);
    }
    const options = ["Idea", "MVP", "Revenue-generating"]
    return(
        <div className='flex '>
      <div className="space-y-2">
        <Label>Stage</Label>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder={selectedValues.length ===0?"Select Stage":selectedValues.join(',')} />
                    </SelectTrigger>
                    <SelectContent className="">
                    {options.map((option)=>(
                        
                        <Label key={option} className="flex items-center p-2">
                            <Checkbox
                                onCheckedChange={(e)=>onCheckboxChange(e, option)}
                                checked={selectedValues.includes(option)}
                                className="mr-2"
                            />
                            {option}
                        </Label>
                    
                    ))}
                    
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
    
}