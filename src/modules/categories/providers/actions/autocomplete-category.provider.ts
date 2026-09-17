import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Category } from '../../entities/category.entity.js';
import { CategoryAutocompleteDto } from '../../dto/category-autocomplete.dto.js';

@Injectable()
export class AutocompleteCategoryProvider {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  public async getSuggestions(dto: CategoryAutocompleteDto) {
    // 1. Fetch categories matching the keyword (case-insensitive)
    const categories = await this.categoryRepository.find({
      where: {
        name: ILike(`%${dto.keyword}%`),
      },
      relations: {
        children: true,
        parent: true,
      },
      take: 5, // Limit results for high performance (standard for autocomplete)
    });

    // 2. Map the entity to a front-end friendly suggestion format
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      // If it belongs to a parent, show it
      parent: category.parent
        ? { id: category.parent.id, name: category.parent.name }
        : null,
      // Suggest related sub-categories to the user
      suggestedTopics: category.children.map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
      })),
    }));
  }
}
