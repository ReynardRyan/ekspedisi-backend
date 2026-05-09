import { AuthLoginDto } from "./dto/auth.dto";
import { AuthLoginResponse, UserResponse } from "./response/auth.response";
import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import * as bcrypt from "bcrypt"
import { JwtService } from "@nestjs/jwt";
import { plainToInstance } from "class-transformer";
import { AuthRegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
    constructor(
        private prismaService: PrismaService,
        private jwtService: JwtService) { }
    async login(request: AuthLoginDto): Promise<AuthLoginResponse> {
        const user = await this.prismaService.user.findUnique({
            where: {
                email: request.email,
            },
            include: {
                role: {
                    include: {
                        rolePermissions: {
                            include: {
                                permission: true,
                            }
                        }
                    }
                }
            }
        });

        if (!user) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(request.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.roleId,
        }

        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET || 'secret key',
            expiresIn: process.env.JWT_EXPIRES_IN || '1h' as any,
        });

        const { password, ...userWithoutPassword } = user;

        const transformerUser = {
            ...userWithoutPassword,
            role: {
                ...user.role,
                permissions: user.role.rolePermissions.map((rolePermission) => ({
                    id: rolePermission.permission.id,
                    name: rolePermission.permission.name,
                    key: rolePermission.permission.key,
                    resource: rolePermission.permission.resource,
                }))
            }
        }

        const userResponse = plainToInstance(UserResponse, transformerUser, {
            excludeExtraneousValues: true
        })
        return plainToInstance(AuthLoginResponse, {
            accessToken,
            user: userResponse,
        }, {
            excludeExtraneousValues: true
        })
    }

    async register(request: AuthRegisterDto): Promise<AuthLoginResponse> {
        const existingUserEmail = await this.prismaService.user.findUnique({
            where: {
                email: request.email,
            },
        });

        if (existingUserEmail) {
            throw new UnauthorizedException("Email already exists");
        }

        const role = await this.prismaService.role.findFirst({
            where: {
                key: "customer",
            },
        });

        if (!role) {
            throw new NotFoundException("Role not found");
        }

        const hashedPassword = await bcrypt.hash(request.password, 10);

        const user = await this.prismaService.user.create({
            data: {
                name: request.name,
                email: request.email,
                password: hashedPassword,
                phoneNumber: request.phone_number,
                roleId: role.id,
            },
            include: {
                role: {
                    include: {
                        rolePermissions: {
                            include: {
                                permission: true,
                            }
                        }
                    }
                }
            }
        });

        const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.roleId,
        }

        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET || 'secret key',
            expiresIn: process.env.JWT_EXPIRES_IN || '1h' as any,
        });

        const { password, ...userWithoutPassword } = user;

        const transformerUser = {
            ...userWithoutPassword,
            role: {
                ...user.role,
                permissions: user.role.rolePermissions.map((rolePermission) => ({
                    id: rolePermission.permission.id,
                    name: rolePermission.permission.name,
                    key: rolePermission.permission.key,
                    resource: rolePermission.permission.resource,
                }))
            }
        }

        const userResponse = plainToInstance(UserResponse, transformerUser, {
            excludeExtraneousValues: true
        })
        return plainToInstance(AuthLoginResponse, {
            accessToken,
            user: userResponse,
        }, {
            excludeExtraneousValues: true
        })
    }
}
