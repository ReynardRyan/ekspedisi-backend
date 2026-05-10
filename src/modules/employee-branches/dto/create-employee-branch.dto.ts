import z, { number, string, ZodObject } from "zod";

const employeeBranchesSchema = z.object({
    name: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string",
    }).min(3, "Name must be at least 3 characters long"),
    phone_number: z.string({
        required_error: "Phone number is required",
        invalid_type_error: "Phone number must be a string",
    }).min(10, "Phone number must be at least 10 characters long").max(15, "Phone number must be at most 15 characters long"),
    email: z.string({
        required_error: "Email is required",
        invalid_type_error: "Email must be a string",
    }).email("Email is invalid"),
    branch_id: z.number({
        required_error: "Branch ID is required",
        invalid_type_error: "Branch ID must be a number",
    }).min(1, "Branch ID must be at least 1"),
    type: z.string({
        required_error: "Type is required",
        invalid_type_error: "Type must be a string",
    }).min(1, "Type must be at least 1 character long"),
    role_id: z.number({
        required_error: "Role ID is required",
        invalid_type_error: "Role ID must be a number",
    }).min(1, "Role ID must be at least 1"),
    password: z.string({
        required_error: "Password is required",
        invalid_type_error: "Password must be a string",
    }).min(8, "Password must be at least 8 characters long"),
    avatar: z.string().optional().nullable(),
})

export class CreateEmployeeBranchDto {
    static schema: ZodObject<any> = employeeBranchesSchema;

    constructor(
        public name: string,
        public phone_number: string,
        public email: string,
        public branch_id: number,
        public type: string,
        public role_id: number,
        public password: string,
        public avatar: string | null,
    ) { }
}