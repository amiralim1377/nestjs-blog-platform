import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity.js';
import { UpdateCategoryDto } from '../../dto/update-category.dto.js';

@Injectable()
export class UpdateCategoryProvider {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  public async updateCategory(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ) {
    const { parentId, ...restDto } = updateCategoryDto;

    // 1. Find existing category
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} was not found.`);
    }

    // 2. Validate new parent logic if parentId is provided
    let parentCategory: Category | null = null;
    if (parentId !== undefined) {
      if (parentId === id) {
        throw new BadRequestException('A category cannot be its own parent.');
      }

      // If parentId is not null, verify it exists
      if (parentId !== null) {
        parentCategory = await this.categoryRepository.findOneBy({
          id: parentId,
        });
        if (!parentCategory) {
          throw new NotFoundException(
            `Parent category with ID ${parentId} was not found.`,
          );
        }
      }

      // Update the parent relation
      category.parent = parentCategory ?? undefined;
    }

    // 3. Update the rest of the fields
    Object.assign(category, restDto);

    // 4. Save and return
    return await this.categoryRepository.save(category);
  }
}
