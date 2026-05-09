import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaService } from './common/prisma/prisma.service';
import { JwtStrategy } from './modules/auth/strategies/jwt.strategy';
import { RolesModule } from './modules/roles/roles.module';


@Module({
    imports: [AuthModule, RolesModule],
    controllers: [AppController],
    providers: [AppService, JwtStrategy, PrismaService],
})
export class AppModule { }
