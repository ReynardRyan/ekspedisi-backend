import { z } from "zod";

export const createUserAddressSchema = z.object({
    address: z
        .string({
            required_error: "Alamat harus diisi",
            invalid_type_error: "Alamat harus string"
        })
        .min(1, "Alamat harus minimal 1 karakter"),
    tag: z
        .string({
            required_error: "Tag harus diisi",
            invalid_type_error: "Tag harus string"
        })
        .min(1, "Tag harus minimal 1 karakter"),
    label: z
        .string({
            required_error: "Label harus diisi",
            invalid_type_error: "Label harus string"
        })
        .min(1, "Label harus minimal 1 karakter"),
    photo: z.string().optional().nullable()
})

export class CreateUserAddressDto {
    static schema: z.ZodObject<any> = createUserAddressSchema;

    constructor(
        public address: string,
        public tag: string,
        public label: string,
        public photo: string | null
    ) { }
}