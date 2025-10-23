import z from 'zod';
export const LoginValidationSchema = z.object({
    email: z.email().min(1, "Email is required"),
    password: z.string().min(1, "Password is required")
});



export const ForgorPasswordSchema = LoginValidationSchema.pick({
    email: true
});

export const PasswordResetSchema = z.object({
    password: z.string().min(8, 'Password must be more than 8 characters')
                        .regex(/^(?=.*[A-Z]).*$/, 'Password must contain at least one uppercase letter.')
                        .regex(/.*\d.*/, 'Must contain at least one digit')
                        .regex(/^(?=.*[a-z]).*$/, 'Password must contain at least one lowercase letter.')
                        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character.'),
    confirmPassword: z.string()
}).refine((data)=>data.password===data.confirmPassword,{
    message:'Password Does not match',
    path:['confirmPassword']
})

export type PasswordResetType = z.infer<typeof PasswordResetSchema>;

export type ForgorPasswordType = z.infer<typeof ForgorPasswordSchema>;

export type LoginFormData = z.infer<typeof LoginValidationSchema>;

