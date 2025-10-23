import { ArrowDown, ArrowUp, ArrowUpWideNarrow, ChartColumnIncreasing, House } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import type { FC } from "react";


type StatCardProps = {
    title:string;
    totalCount:number;
    changes:number,
    icon?:React.ReactNode
}
const StatCard:FC<StatCardProps> = ({title, totalCount, changes, icon}) => {
    return (
        <Card className="max-w-md">
            <CardHeader>
                
            </CardHeader>
            <CardContent >
                <div className="flex  justify-between items-center">
                    <div className="text-sm">
                        <h4 className="md:text-2xl  text-gray-500">{title}</h4>
                        <h4 className="md:text-3xl text-gray-900 font-extrabold">{totalCount}</h4>
                    </div>
                    {icon}
                </div>
            </CardContent>
            <CardFooter>
                <div className="w-full flex text-sm gap-2 items-center justify-between">
                    <span className="text-gray-500">Since yesterday</span>
                    <div className="flex items-center text-gray-600">
                        {changes > 0 ? (<div className="text-green-500 flex"><ArrowUp className="w-5 h-5"/>
                        {`${Math.floor(changes)}%`}</div>):(<div className="flex text-red-500"><ArrowDown className="w-5 h-5"/>{`${Math.floor(changes)}%`}</div>)}
                        

                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}

export default StatCard;