import { Expose } from "class-transformer";

export class ProfileResponse {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    email: string;

    @Expose()
    avatar: string;

    @Expose()
    phoneNumber: string;
}