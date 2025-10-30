import { cn } from "@/lib/utils";
import { useState, type FC } from "react";
import { Button } from "./ui/button";
import { useMenuStore } from "store/menustore";
type MenuItemProps = {
    item:any,
    depth: number
}
const MenuItem:FC<MenuItemProps> = ({item, depth}) => {
    const {selectMenu, removeMenu} = useMenuStore()
    const hasChildren = item.children && item.children.length > 0;
        const indentation = 28; // 20 pixels per depth level
    const paddingStyle = { 
        paddingLeft: `${(depth * indentation)}px` }
    return (
        <li className="relative space-y-1 p-2" >
            {/* Menu Item Container */}
            <div 
                className={cn(` flex items-center  justify-between  rounded-lg gap-2`)}
                style={paddingStyle}
                data-item-id={item.id}
                onClick={()=>selectMenu(item.id)}
            >
                {/* Link/Text */}
                <span  
                    className="flex-grow font-medium border rounded-md p-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition duration-150 ease-in-out cursor-pointer"
                    // Prevent the nested <a> click from bubbling up if it doesn't have children
                    onClick={(e) => hasChildren ? e.preventDefault() : null}
                >
                    {item.menuName}
                </span>
                <div className="flex items-center gap-2">
                    {/* <Button onClick={()=>selectMenu(item.id)}>Edit</Button> */}
                    <Button variant="destructive" onClick={()=>removeMenu(item.id)} >Delete</Button>
                </div>
                {/* Toggle Button for Children */}
                
            </div>

            {/* Submenu Container (Recursive Call) */}
            {hasChildren && (
                <>
                    {item.children.map((child:any) => (
                        <MenuItem key={`child-${child.id}`} item={child} depth={depth + 1} />
                    ))}
                </>
            )}
        </li>
    );
};

export default MenuItem;
