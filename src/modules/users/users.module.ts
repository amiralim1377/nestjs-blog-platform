import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { UsersService } from './providers/users.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { CreateUserProvider } from './providers/actions/create-user.provider.js';
import { ExistsByEmailProvider } from './providers/actions/exists-by-email.provider.js';
import { UpdateUserProvider } from './providers/actions/update-user.provider.js';
import { RemoveUserProvider } from './providers/actions/remove-user.provider.js';
import { FindAllUsersProvider } from './providers/actions/find-all-user.js';
import { PaginationProvider } from '../../common/pagination/providers/pagination.providers.js';
import { UpdatePasswordInDatabaseProvider } from './providers/actions/update-password-in-database.provider.js';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [
    UsersService,
    CreateUserProvider,
    ExistsByEmailProvider,
    UpdateUserProvider,
    RemoveUserProvider,
    FindAllUsersProvider,
    PaginationProvider,
    UpdatePasswordInDatabaseProvider,
  ],
  exports: [UsersService],
})
export class UsersModule {}
