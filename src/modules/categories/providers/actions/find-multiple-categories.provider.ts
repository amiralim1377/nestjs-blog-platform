import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Category } from '../../entities/category.entity.js';

@Injectable()
export class FindMultipleCategoriesProvider {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  public async findMultiple(categoryIds: number[]): Promise<Category[]> {
    if (!categoryIds || categoryIds.length === 0) {
      return [];
    }

    // 1. Remove duplicate IDs in case the client mistakenly sent [1, 1, 2]
    const uniqueIds = Array.from(new Set(categoryIds));

    // 2. Fetch all categories matching the provided IDs
    const categories = await this.categoryRepository.find({
      where: {
        id: In(uniqueIds),
      },
    });

    // 3. Check if we found exactly as many categories as requested
    if (categories.length !== uniqueIds.length) {
      const foundIds = categories.map((category) => category.id);

      // Figure out exactly which IDs were missing to give a helpful error message
      const missingIds = uniqueIds.filter((id) => !foundIds.includes(id));

      throw new NotFoundException(
        `One or more categories were not found. Missing IDs: [${missingIds.join(', ')}]`,
      );
    }

    // 4. Return the valid categories
    return categories;
  }
}
