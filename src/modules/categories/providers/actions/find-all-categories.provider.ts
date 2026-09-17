import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Category } from '../../entities/category.entity.js';
import { GetCategoriesDto } from '../../dto/get-categories.dto.js';
import { PaginationProvider } from '../../../../common/pagination/providers/pagination.providers.js';

@Injectable()
export class FindAllCategoriesProvider {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly paginationProvider: PaginationProvider,
  ) {}

  public async findAllCategories(
    getCategoriesDto: GetCategoriesDto,
    currentUrl: string,
  ) {
    const whereConditions: any = {};
    if (getCategoriesDto.search) {
      whereConditions.name = ILike(`%${getCategoriesDto.search}%`);
    }

    return await this.paginationProvider.paginateQuery(
      getCategoriesDto,
      this.categoryRepository,
      currentUrl,
      {
        where: whereConditions,
        relations: { parent: true },
        order: { createdAt: 'DESC' },
      },
    );
  }
}
