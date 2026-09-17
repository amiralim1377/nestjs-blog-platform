import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller.js';
import { CategoriesService } from './providers/categories.service.js';
import { AutocompleteCategoryProvider } from './providers/actions/autocomplete-category.provider.js';
import { CreateCategoryProvider } from './providers/actions/create-category.provider.js';
import { UpdateCategoryProvider } from './providers/actions/update-category.provider.js';
import { DeleteCategoryProvider } from './providers/actions/delete-category.provider.js';
import { PaginationModule } from '../../common/pagination/pagination.module.js';
import { Category } from './entities/category.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), PaginationModule],
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    CreateCategoryProvider,
    AutocompleteCategoryProvider,
    UpdateCategoryProvider,
    DeleteCategoryProvider,
  ],
})
export class CategoriesModule {}
