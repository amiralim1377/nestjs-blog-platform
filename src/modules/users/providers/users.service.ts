import {
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity.js';
import { Repository } from 'typeorm';
import { CreateUserProvider } from './actions/create-user.provider.js';
import { ExistsByEmailProvider } from './actions/exists-by-email.provider.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';
import { UpdateUserProvider } from './actions/update-user.provider.js';
import { RemoveUserProvider } from './actions/remove-user.provider.js';
import { FindAllUsersProvider } from './actions/find-all-user.provider.js';
import { GetUsersDto } from '../dto/get-users.dto.js';
import { UpdatePasswordInDatabaseProvider } from './actions/update-password-in-database.provider.js';
import { UploadAvatarProvider } from './actions/upload-user-avatar.provider.js';
import { ActiveUserData } from '../../auth/interfaces/active-user-data.interface.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private readonly createUserProvider: CreateUserProvider,
    private readonly existsByEmailProvider: ExistsByEmailProvider,
    private readonly updateUserProvider: UpdateUserProvider,
    private readonly removeUserProvider: RemoveUserProvider,
    private readonly findAllUsersProvider: FindAllUsersProvider,
    private readonly updatePasswordInDatabaseProvider: UpdatePasswordInDatabaseProvider,
    private readonly uploadAvatarProvider: UploadAvatarProvider,
  ) {}

  async findByEmail(email: string) {
    const user = await this.usersRepository.findOne({
      where: { email: email },
    });

    return user;
  }

  /**
   * Find a single user using the ID of the user
   */
  async findById(id: string) {
    let user = undefined;
    try {
      user = await this.usersRepository.findOneBy({
        id,
      });
    } catch {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
        {
          description: 'Error connecting to database',
        },
      );
    }

    if (!user) {
      throw new NotFoundException('The user id does not exist');
    }

    return user;
  }

  async findAllUser(postQuery: GetUsersDto, currentUrl: string) {
    return await this.findAllUsersProvider.findAll(postQuery, currentUrl);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const exists = await this.existsByEmailProvider.existsByEmail(email);
    return exists;
  }

  async update(userId: string, updateUserDto: UpdateUserDto) {
    return this.updateUserProvider.updateUserInfo(userId, updateUserDto);
  }

  async remove(userId: string) {
    return this.removeUserProvider.removeUser(userId);
  }

  async create(createUserDto: CreateUserDto) {
    return this.createUserProvider.create(createUserDto);
  }

  async updatePasswordInDatabase(userId: string, hashedNewPassword: string) {
    return this.updatePasswordInDatabaseProvider.updatePasswordInDataBase(
      userId,
      hashedNewPassword,
    );
  }

  async uploadAvatar(file: Express.Multer.File, activeUser: ActiveUserData) {
    return this.uploadAvatarProvider.uploadAvatar(file, activeUser);
  }
}
