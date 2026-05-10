import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function employeeBranchesSeed() {
    const employeeBranchesPath = path.resolve(__dirname, 'data', 'employee-branches.json');
    const employeeBranchesRaw = fs.readFileSync(employeeBranchesPath, 'utf-8');
    const employeeBranches = JSON.parse(employeeBranchesRaw).data;

    for (const employeeBranch of employeeBranches) {
        const role = await prisma.role.findFirst({
            where: { key: employeeBranch.role_key },
        });
        if (!role) {
            console.log(`Role ${employeeBranch.role_key} not found`);
            continue;
        }

        const branch = await prisma.branch.findFirst({
            where: { name: employeeBranch.branch_name },
        });
        if (!branch) {
            console.log(`Branch ${employeeBranch.branch_name} not found`);
            continue;
        }

        const user = await prisma.user.upsert({
            where: {
                email: employeeBranch.email,
            },
            update: {},
            create: {
                name: employeeBranch.name,
                email: employeeBranch.email,
                phoneNumber: employeeBranch.phoneNumber,
                password: await bcrypt.hash(employeeBranch.password, 10),
                roleId: role.id,
                avatar: employeeBranch.avatar,
            },
        });

        const existingemployeeBranch = await prisma.employeeBranch.findFirst({
            where: {
                userId: user.id,
                branchId: branch.id,
            },
        });
        if (existingemployeeBranch) {
            console.log(`Employee branch for user ${user.email} already exists`);
            continue;
        }
        await prisma.employeeBranch.create({
            data: {
                userId: user.id,
                branchId: branch.id,
                type: employeeBranch.type,
            },
        });
    }
}

// For running directly
if (require.main === module) {
    employeeBranchesSeed()
        .catch((e) => {
            console.error(e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
