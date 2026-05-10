import { z, ZodObject } from "zod";

const createBranchSchema = z.object({
    name: z.string({
        required_error: 'Name is required',
        invalid_type_error: 'Name must be a string'
    }).min(1, 'Name must be at least 1 characters long'),
    address: z.string({
        required_error: 'Address is required',
        invalid_type_error: 'Address must be a string'
    }).min(1, 'Address must be at least 1 characters long'),
    phone_number: z.string({
        required_error: 'Phone number is required',
        invalid_type_error: 'Phone number must be a string'
    }).min(1, 'Phone number must be at least 1 characters long'),
})

export class CreateBranchDto {
    static schema: ZodObject<any> = createBranchSchema;

    constructor(
        public readonly name: string,
        public readonly address: string,
        public readonly phone_number: string,
    ) { }

}