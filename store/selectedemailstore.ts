import { create } from "zustand"
import { combine } from "zustand/middleware"

interface SelectedEmailState{
    selectedUserEmails: any[],
    addSelectedUserEmail:(emailInfo:any[])=>void,
    removeSelectedUserEmail:(entry_id: number)=>void,
    clearSelectedUserEmails:()=>void
}
export const useSelectedEmailStore = create<SelectedEmailState>()(
    combine(
        {
            selectedUserEmails: [] as any[]
        },
        (set) => ({
            addSelectedUserEmail(emailInfo:any[]){
                set((state:any)=>({
                    selectedUserEmails: [...emailInfo]
                }))
            },
            removeSelectedUserEmail(entry_id: number){
                set((state)=>({
                    selectedUserEmails: state.selectedUserEmails.filter((email)=>email.entry_id != entry_id)
                }))
            },
            clearSelectedUserEmails(){
                set(()=>({
                    selectedUserEmails: []
                }))
            }
        })
    )
)