import z from "zod";

export const MenuSchema = z.object({
    menuName: z.string().min(1,{message: 'Menu name required'}),
    route: z.string().min(1,{message: 'Route required'}),
    parent: z.any().nullable()
})

export type MenuSchemaType = z.infer<typeof MenuSchema>;