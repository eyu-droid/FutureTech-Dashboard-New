import { useMenuStore } from "store/menustore"
import MenuItem from "./menuitem";

export const ListMenus = ()=>{
    const{menus} = useMenuStore();

    return(
        <div className="w-[70%] border h-72 overflow-auto">
                    {menus && menus.length > 0 && (
                        <ul className="space-y-1">
                            {menus.map((item:any) => (
                                <MenuItem key={item.id} item={item} depth={0} />
                            ))}
                        </ul>)}
                </div>
    )
}