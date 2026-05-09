import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "../decorators/permission.decorator";
import { PermissionsService } from "src/modules/permissions/permissions.service";

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private permissionsService: PermissionsService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const permissionMetadata = this.reflector.getAllAndOverride(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
        if (!permissionMetadata) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('Forbidden');
        }

        if (typeof permissionMetadata === 'object' && permissionMetadata.type === 'any') {
            const { type, permissions } = permissionMetadata;

            let hasPermission = false;

            if (type === 'any') {
                hasPermission = await this.permissionsService.userHasAnyPermission(user.id, permissions);
            } else if (type === 'all') {
                hasPermission = await this.permissionsService.userHasAllPermissions(user.id, permissions);
            }

            if (!hasPermission) {
                throw new ForbiddenException('Forbidden');
            }

            return true;
        } else {
            const permissions = Array.isArray(permissionMetadata) ? permissionMetadata : [permissionMetadata];
            const hasPermission = await this.permissionsService.userHasAllPermissions(user.id, permissions);
            if (!hasPermission) {
                throw new ForbiddenException('Forbidden');
            }
        }
        return true;
    }
}