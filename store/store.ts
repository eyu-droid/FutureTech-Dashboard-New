import type { FollowUpListType } from '@/types/followup'
import type { FollowUpNotes } from '@/types/followupnotes';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import {create} from 'zustand'
import {combine, persist} from 'zustand/middleware';

interface FollowUpState {
    followUp: FollowUpListType[],
    changeStatus: (entry_id: number, status: "Completed" | "NotStarted") => void,
    initialFollowUp: (followUp: FollowUpListType, entryId: number) => void,
    getFollowUp: (entry: number) => FollowUpListType | undefined
}

const useFollowUpStore = create<FollowUpState>()(
    combine(
        {
            followUp: [] as FollowUpListType[],
        },
        (set, get)=>({
            changeStatus(entry_id, status) {
                set((state)=>({
                    followUp:state.followUp.map((f)=>f.entry_id==entry_id?{...f, status:status}:f)
                }))
            },
            getFollowUp(entry) {
                console.log(entry)
                return get().followUp.find((value)=>value.entry_id == entry)
            },
            initialFollowUp(followUp, entryId) {
                set((state)=>({
                    followUp: [...state.followUp, followUp].filter((value, index,self)=>index===self.findIndex((t)=> t.id === value.id))
                }))
            },
        })
    )
)

interface NoteState {
    notes: FollowUpNotes[],
    addNote:(note:FollowUpNotes)=>void,
    initalNotes:(notes:FollowUpNotes[])=>void
    markCompleted: (id:string, status:number)=>void,
    deleteNote:(id:string)=>void
}
export const useFollowUpNoteStore = create<NoteState>()(
    combine(
        {
            notes: [] as FollowUpNotes[]
        },
        (set, get) => ({
            addNote(note: FollowUpNotes) {
                set((state) => ({
                    notes: [...state.notes, note]
                }));
            },
            markCompleted(id: string, status: number) {
                set((state) => ({
                    notes: state.notes.map((n) =>
                        n.Id === id ? { ...n, isCompleted: status } : n
                    )
                }));
            },
            initalNotes(notes){
                set(()=>({
                    notes: notes
                }))
            },
            deleteNote(id: string) {
                set((state) => ({
                    notes: state.notes.filter((n) => n.Id !== id)
                }));
            },
        })
    )
)



export default useFollowUpStore;