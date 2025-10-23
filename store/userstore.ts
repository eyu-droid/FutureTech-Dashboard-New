import { useAuth } from "@/components/authprovider";
import axiosInstance from "@/lib/axiosinstance";
import { type response } from "@/types/response";
import { useQuery } from "@tanstack/react-query";
import { create, createStore } from "zustand";
import { combine } from "zustand/middleware";

type User = {
    userId: string;
    email: string;
    role: number;
}

interface UserStoreState {
    user: User;
    setUser: (user: User) => void;
}

export const useUserStore = create<UserStoreState>()(
    combine(
        {
            user: {} as User
        },
        (set) => ({
            setUser(user: User) {
                set(() => ({
                    user: user
                }));
            }
        })
    )
)

export async function GetUser(token: string) {
    try{

        const res = await axiosInstance.get<response<User>>("/user/me", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });
        return res.data.data as User;
    }catch(err){
        throw err;
    }

}