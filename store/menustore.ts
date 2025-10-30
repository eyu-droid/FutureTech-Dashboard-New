import type { MenuSchemaType } from "@/types/menus";
import { create } from "zustand";
import { combine } from "zustand/middleware";

interface UseMenuStoreState {
    menus: any[];
    menu: any | null;
    initialState: (menus: any[]) => void;
    addMenu: (menu: any, parentId?: number) => void;
    removeMenu: (id: number) => void;
    getMenuById: (id: number) => any | undefined;
    editMenu: (id: number, updatedMenu: Partial<any>) => void;
    selectMenu:(id:number)=>void;
    clearSelectedMenu:()=>void;
}

export const useMenuStore = create<UseMenuStoreState>((set, get) => ({
    menus: [] as any[],
    menu: null,
    initialState(menus: any[]) {
        set(() => ({
            menus: menus,
        }));
    },
    addMenu(menu: any, parentId?: number) {
        set((state) => {
            if (parentId) {
                const addChild = (menus: any[]): any[] => {
                    return menus.map((m:any) => {
                        if (m.id === parentId) {
                            return {
                                ...m,
                                children: [...(m.children ?? []), menu],
                            };
                        }
                        return {
                            ...m,
                            children: addChild(m.children ?? []),
                        };
                    });
                };
                return { menus: addChild(state.menus) };
            } else {
                return { menus: [...state.menus, menu] };
            }
        });
    },
    removeMenu(id: number) {
        const removeChild = (menus: any[]): any[] => {
            return menus
                .filter((m) => m.id !== id)
                .map((m) => ({
                    ...m,
                    children: removeChild(m.children ?? []),
                }));
        };
        set((state) => ({
            menus: removeChild(state.menus),
        }));
    },
    getMenuById(id: number) {
        const findMenu = (menus: any[]): any | undefined => {
            for (const menu of menus) {
                if (menu.id === id) return menu;
                const found = findMenu(menu.children ?? []);
                if (found) return found;
            }
            return undefined;
        };
        return findMenu(get().menus);
    },
    selectMenu(id: number){
        set((state)=>({
            menu: state.getMenuById(id)
        }))
    },
    editMenu(id: number, updatedMenu: Partial<any>) {
        const editChild = (menus: any[]): any[] => {
            return menus.map((m) => {
                if (m.id === id) {
                    return { ...m, ...updatedMenu };
                }
                return {
                    ...m,
                    children: editChild(m.children ?? []),
                };
            });
        };
        set((state) => ({
            menus: editChild(state.menus),
        }));
    },
    clearSelectedMenu(){
        set(()=>({
            menu: null
        }))
    }
}));