import { Injectable } from '@nestjs/common';
import { CreateCategoryProvider } from './actions/create-category.provider.js';
import { AutocompleteCategoryProvider } from './actions/autocomplete-category.provider.js';
import { UpdateCategoryProvider } from './actions/update-category.provider.js';
import { DeleteCategoryProvider } from './actions/delete-category.provider.js';
import { FindAllCategoriesProvider } from './actions/find-all-categories.provider.js';
import { GetCategoriesDto } from '../dto/get-categories.dto.js';
import { UpdateCategoryDto } from '../dto/update-category.dto.js';
import { CreateCategoryDto } from '../dto/create-category.dto.js';
import { CategoryAutocompleteDto } from '../dto/category-autocomplete.dto.js';
import { FindMultipleCategoriesProvider } from './actions/find-multiple-categories.provider.js';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly createCategoryProvider: CreateCategoryProvider,
    private readonly autocompleteCategoryProvider: AutocompleteCategoryProvider,
    private readonly updateCategoryProvider: UpdateCategoryProvider,
    private readonly deleteCategoryProvider: DeleteCategoryProvider,
    private readonly findAllCategoriesProvider: FindAllCategoriesProvider,
    private readonly findMultipleCategoriesProvider: FindMultipleCategoriesProvider,
  ) {}

  async findAll(getCategoriesDto: GetCategoriesDto, currentUrl: string) {
    return await this.findAllCategoriesProvider.findAllCategories(
      getCategoriesDto,
      currentUrl,
    );
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    return await this.createCategoryProvider.createCategory(createCategoryDto);
  }

  async getAutocompleteSuggestions(dto: CategoryAutocompleteDto) {
    return await this.autocompleteCategoryProvider.getSuggestions(dto);
  }

  async updateCategory(id: number, updateCategoryDto: UpdateCategoryDto) {
    return await this.updateCategoryProvider.updateCategory(
      id,
      updateCategoryDto,
    );
  }

  async deleteCategory(id: number) {
    return await this.deleteCategoryProvider.deleteCategory(id);
  }

  public async findMultipleCategories(categoryIds: number[]) {
    return await this.findMultipleCategoriesProvider.findMultiple(categoryIds);
  }
}
