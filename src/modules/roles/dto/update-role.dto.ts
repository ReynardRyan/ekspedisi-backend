import z, { ZodObject } from "zod";

export const updateRoleSchema = z.object({
    permission_ids: z.array(z.number({
        required_error: "Permission IDs are required",
        invalid_type_error: "Permission IDs must be an array of numbers",
    })
    ).nonempty("At least 1 permission is required")
})

export class UpdateRoleDto {
    static schema: ZodObject<any> = updateRoleSchema;
    constructor(
        public permission_ids: number[]
    ) { }
}