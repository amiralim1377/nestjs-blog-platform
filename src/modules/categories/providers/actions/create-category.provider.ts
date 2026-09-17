import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity.js';
import { CreateCategoryDto } from '../../dto/create-category.dto.js';

@Injectable()
export class CreateCategoryProvider {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  public async createCategory(createCategoryDto: CreateCategoryDto) {
    // 1. Separate parentId from the rest of the payload
    const { parentId, ...restDto } = createCategoryDto;

    // TypeORM findOneBy returns null when a record is not found
    let parentCategory: Category | null = null;

    // 2. Validate and fetch parent category if parentId is provided
    if (parentId) {
      parentCategory = await this.categoryRepository.findOneBy({
        id: parentId,
      });

      if (!parentCategory) {
        throw new NotFoundException(
          `Parent category with ID ${parentId} was not found.`,
        );
      }
    }

    // 3. Instantiate the category entity with the resolved parent reference
    const newCategory = this.categoryRepository.create({
      ...restDto,
      parent: parentCategory ?? undefined,
    });

    // 4. Persist to database; unique constraint violations are handled by TypeOrmExceptionFilter
    return await this.categoryRepository.save(newCategory);
  }
}
