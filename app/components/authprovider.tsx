import axiosInstance from "@/lib/axiosinstance";
import { createContext, useContext, useEffect, useState } from "react";
import { redirect, useLocation, useNavigate } from "react-router";
import Loading from "./loading";
import { GetUser, useUserStore } from "store/userstore";
import { AxiosError } from "axios";

type authContextType = {
    token: string | null,
    setToken:  React.Dispatch<React.SetStateAction<string | null>>
} | null
const authContext = createContext<authContextType>(null);

const excludedPath = ['/register', '/forgot-password', '/reset-password'] 

export default function AuthProvider({children}: {children: React.ReactNode}){
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const {setUser} = useUserStore()
    useEffect(()=>{
        setIsLoading(true)
            if(!token){
                axiosInstance.post('/auth/refresh-token').then(res=>{
                    const data = res.data;
                    if(data){
                        setToken(data.accessToken);
                    }
                }).catch(()=>{
                    navigate('/login');
                }).finally(()=>{
                    setIsLoading(false)
                })  
            }else{
                setIsLoading(false)
                GetUser(token).then((user)=>{
                    setUser(user)
                }).catch((err)=>{
                        err.status === 401 && 
                        navigate('/login')
                });
                
            }
        
    },[token, navigate]);

    return(
        <authContext.Provider value={{setToken, token}}>
            {isLoading && <div className="flex justify-center items-center absolute w-full h-full">
                <Loading/>
                </div>}
            {!isLoading && <>
                {children}
            </>}
            
        </authContext.Provider>
    )

}

export function useAuth(){
    if(!authContext){
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return useContext(authContext);
}