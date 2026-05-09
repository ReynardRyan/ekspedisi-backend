import { Controller, HttpCode, HttpStatus, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthLoginDto } from "./dto/auth.dto";
import { AuthLoginResponse } from "./response/auth.response";
import { AuthRegisterDto } from "./dto/register.dto";

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post("login")
    async login(@Body() request: AuthLoginDto): Promise<AuthLoginResponse> {
        return await this.authService.login(request);
    }

    @Post("register")
    async register(@Body() request: AuthRegisterDto): Promise<AuthLoginResponse> {
        return await this.authService.register(request);
    }
}