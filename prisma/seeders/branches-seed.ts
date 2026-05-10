import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

export async function branchesSeed() {
    const branchesPath = path.resolve(__dirname, 'data', 'branches.json');
    const branchesRaw = fs.readFileSync(branchesPath, 'utf-8');
    const branches = JSON.parse(branchesRaw).data;

    for (const branch of branches) {
        const existingBranch = await prisma.branch.findFirst({
            where: { name: branch.name },
        });
        if (!existingBranch) {
            await prisma.branch.create({
                data: {
                    name: branch.name,
                    phoneNumber: branch.phone,
                    address: branch.address,
                },
            });
        }
    }
}

// For running directly
if (require.main === module) {
    branchesSeed()
        .catch((e) => {
            console.error(e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
