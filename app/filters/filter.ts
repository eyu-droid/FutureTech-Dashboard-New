import { type FilterFn } from "@tanstack/react-table";
import { parseISO, isAfter, isBefore, isValid, isEqual } from "date-fns";
export const dateRangeFilter: FilterFn<any> = (row, columnId, filterValue) => {
  // filterValue is expected to be an array: [startDate, endDate]
  const [startDateStr, endDateStr] = filterValue as [string | null, string | null];

  // Get the date value from the current row for the specific column
  const rowDateValue = row.getValue(columnId) as string | number | Date;
  
  if (!rowDateValue) return true; // If no date, consider it a match (or adjust logic as needed)

  // Convert row date to a Date object
  const rowDate = rowDateValue instanceof Date ? rowDateValue : parseISO(String(rowDateValue));
  if (!isValid(rowDate)) return true; // Invalid date, assume match

  let startDate: Date | null = null;
  let endDate: Date | null = null;

  // Convert filter string inputs to Date objects
  if (startDateStr) {
    startDate = parseISO(startDateStr);
  }
  if (endDateStr) {
    endDate = parseISO(endDateStr);
  }

  const matchesStart = !startDate || isAfter(rowDate, startDate)  || rowDate.getTime() === startDate.getTime();
  const matchesEnd = !endDate || isBefore(rowDate, endDate) || rowDate.getTime() === endDate.getTime();

  return matchesStart && matchesEnd;
};

dateRangeFilter.autoRemove = (val) => !val;

//filter based on sector interests 
export const interestFilter: FilterFn<any> = (row, columnId, filterValue) => {
  if (!filterValue || filterValue.length === 0) return true; // No filter applied
  
  const rowValue = row.getValue(columnId) as string;
  if (!rowValue) return false; // No value in the row, cannot match
  const interests = rowValue.split(',').map((s) => s.trim().toLowerCase());
  const filterInterests = (filterValue as string[]).map((s) => s.trim().toLowerCase());
  
  // Check if any of the filter interests are in the row's interests
  return filterInterests.some((interest) => interests.includes(interest));
}
interestFilter.autoRemove = (val) => !val || val.length === 0;

export const professionFilter: FilterFn<any> = (row, columnId, filterValue) => {
  if(!filterValue || filterValue.length === 0) return true; // No filter applied
  const rowValue = row.getValue(columnId) as string;
  if(!rowValue) return false;
  const professions = rowValue;
  const filterProfessions = (filterValue as string[]).map((s) => s.trim().toLowerCase());
  
  return filterProfessions.includes(professions.trim().toLowerCase());
}
professionFilter.autoRemove = (val) => !val || val.length === 0;


// export const filterByAll: FilterFn<any> = (row, columnId, filterValue)=>{
//   if(!filterValue || filterValue.length === 0) return true;
//   const rowValue = row.getValue(columnId) as string;
//   if(!rowValue) return false;
//   const 
// }

export const filterByStage: FilterFn<any> = (row, columnId, filterValue)=>{
  if(!filterValue || filterValue.length === 0) return true;
  const rowValue = row.getValue(columnId) as string;
  if(!rowValue) return false;
  const stage = rowValue;
  const filterStages = (filterValue as string[]).map((s)=> s.trim().toLowerCase());
  return filterStages.includes(stage.trim().toLowerCase());
}
filterByStage.autoRemove = (val) => !val || val.length === 0;

export const filterByBooth: FilterFn<any> = (row, columnId, filterValue)=>{
  if(!filterValue || filterValue.length === 0) return true;
  const rowValue = row.getValue(columnId) as string;
  if(!rowValue) return false;
  const stage = rowValue;
  const filterStages = (filterValue as string).toLowerCase();
  return filterStages === stage.toLowerCase();
}

filterByBooth.autoRemove = (val) => !val 

