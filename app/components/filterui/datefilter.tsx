import React from 'react';
import { type Column } from '@tanstack/react-table';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
export function DateRangeColumnFilter({ column }: { column: Column<any, unknown> }) {
  // The filter value is expected to be an array: [startDate, endDate]
  const columnFilterValue = (column.getFilterValue() ?? []) as [string, string];
  const [startDate, endDate] = columnFilterValue;

  const onStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Set the start date in the filter array, keeping the existing end date
    column.setFilterValue([e.target.value, endDate]);
  };

  const onEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Set the end date in the filter array, keeping the existing start date
    column.setFilterValue([startDate, e.target.value]);
  };

  return (
    <div className='flex flex-wrap items-center justify-center gap-3'>
      <div className='space-y-2'>
        <Label>From</Label>
        <Input
          type="date"
          value={startDate || ''}
          max={endDate}
          onChange={onStartDateChange}
          placeholder="Start Date"
        />

      </div>
      <div className='space-y-2'>
        <Label>To</Label>
        <Input
          type="date"
          value={endDate || ''}
          min={startDate}
          onChange={onEndDateChange}
          placeholder="End Date"
        />
      </div>
    </div>
  );
}