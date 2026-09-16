import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationProvider } from '../../../../common/pagination/providers/pagination.providers.js';
import { GetUsersDto } from '../../dto/get-users.dto.js';
import { User } from '../../entities/user.entity.js';

@Injectable()
export class FindAllUsersProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly paginationProvider: PaginationProvider,
  ) {}

  async findAll(usersQuery: GetUsersDto, currentUrl: string) {
    const whereConditions = {};

    return this.paginationProvider.paginateQuery(
      usersQuery,
      this.usersRepository,
      currentUrl,
      {
        where: whereConditions,
        order: {
          createdAt: 'DESC',
        },
      },
    );
  }
}
