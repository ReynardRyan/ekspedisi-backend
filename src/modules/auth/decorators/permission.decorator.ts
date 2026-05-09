import { SetMetadata } from "@nestjs/common";

export const PERMISSIONS_KEY = 'permissions';
export const RequiredPermissions = (...permissions: string[]) => { return SetMetadata(PERMISSIONS_KEY, permissions) };
export const RequiredAnyPermissions = (...permissions: string[]) => { return SetMetadata(PERMISSIONS_KEY, { permissions, type: 'any' }) };
export const RequiredAllPermissions = (...permissions: string[]) => { return SetMetadata(PERMISSIONS_KEY, { permissions, type: 'all' }) };