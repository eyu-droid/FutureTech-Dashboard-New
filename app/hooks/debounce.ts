import { useEffect, useState } from "react"

export const useDebounce = (value:any, delay:number)=>{
    const [debounceValue, setDeBounceValue] = useState();

    useEffect(()=>{
        const timeoutHandler = setTimeout(()=>{
            setDeBounceValue(value);
        }, delay)
        return ()=>{
            clearTimeout(timeoutHandler)
        }
    }, [value, delay])

    return debounceValue;
}

