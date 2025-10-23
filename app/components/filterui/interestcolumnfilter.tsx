import type { Column } from "@tanstack/react-table"
import { useState } from "react";
import { Checkbox } from "../ui/checkbox";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
export const InterestColumnFilter = ({ column }: { column: Column<any, unknown>})=>{
    const columnFilterValue = column.getFilterValue() ?? "";
    const [selectedValues, setSelectedValues] = useState<string[]>(Array.isArray(columnFilterValue) ? columnFilterValue : []);
    const onCheckboxChange = (e: CheckedState, option:string)=>{
        let newSelectedValues = [...selectedValues];
        if(e){
            if(!newSelectedValues.includes('All')){
                newSelectedValues.push('All');
            }
            newSelectedValues.push(option);
        }else{
            if(newSelectedValues.includes('All') && newSelectedValues.length === 2){
                newSelectedValues = newSelectedValues.filter((v)=>v !== 'All');
            }
            newSelectedValues = newSelectedValues.filter((v)=>v !== option);
        }
        setSelectedValues(newSelectedValues);
        column.setFilterValue(newSelectedValues.length ? newSelectedValues : undefined);
    }
    const options = ["Al", "Blockchain", "Cloud", "eCommerce", "BPO"]
    return(
        <div className='flex '>
      <div className="space-y-2">
        <Label>Interest</Label>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder={selectedValues.length ===0?"Select Interests":selectedValues.filter(v=>v!=='All').join(',')} />
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