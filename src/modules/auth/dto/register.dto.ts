import { z, ZodObject } from "zod";

const authregisterSchema = z.object({
    name: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string",
    }),
    phone_number: z.string({
        required_error: "Phone number is required",
        invalid_type_error: "Phone number must be a string",
    }).min(10, "Phone number must be at least 10 digits long"),
    email: z.string({
        required_error: "Email is required",
        invalid_type_error: "Email must be a string",
    }).email("Invalid email"),
    password: z.string({
        required_error: "Password is required",
        invalid_type_error: "Password must be a string",
    }).min(8, "Password must be at least 8 characters long"),
});

export class AuthRegisterDto {
    static schema: ZodObject<any> = authregisterSchema;
    constructor(
        public readonly name: string,
        public readonly phone_number: string,
        public readonly email: string,
        public readonly password: string,
    ) { }
}