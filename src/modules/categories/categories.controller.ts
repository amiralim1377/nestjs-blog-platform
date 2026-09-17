import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { Auth } from '../auth/decorator/auth.decorator.js';
import { AuthType } from '../auth/enums/auth-type.enum.js';
import { CreateCategoryDto } from '../categories/dto/create-category.dto.js';
import { CategoriesService } from '../categories/providers/categories.service.js';
import { CategoryAutocompleteDto } from '../categories/dto/category-autocomplete.dto.js';
import { GetCategoriesDto } from '../categories/dto/get-categories.dto.js';
import { UpdateCategoryDto } from '../categories/dto/update-category.dto.js';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @ApiOperation({
    summary: 'Get all categories with pagination',
    description:
      'Fetches a paginated list of categories with optional search. Public access.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of categories fetched successfully.',
  })
  public async getCategories(
    @Query() getCategoriesDto: GetCategoriesDto,
    @Req() request: Request,
  ) {
    const currentUrl = `${request.protocol}://${request.get('host')}${request.originalUrl}`;
    return this.categoriesService.findAll(getCategoriesDto, currentUrl);
  }

  @Post()
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new category',
    description:
      'Creates a new category. Supports hierarchical structure via parentId. Requires authentication.',
  })
  @ApiResponse({ status: 201, description: 'Category successfully created.' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed (e.g., invalid payload).',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 404, description: 'Parent category not found.' })
  @ApiResponse({
    status: 409,
    description: 'Category with this name or slug already exists.',
  })
  public async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.createCategory(createCategoryDto);
  }

  @Get('autocomplete')
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @ApiOperation({
    summary: 'Predictive search for categories (Autocomplete)',
    description:
      'Returns category suggestions matching the keyword, including parent and children data. Public access.',
  })
  @ApiResponse({
    status: 200,
    description: 'Suggestions fetched successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Search keyword is missing or invalid.',
  })
  public async autocomplete(@Query() dto: CategoryAutocompleteDto) {
    return this.categoriesService.getAutocompleteSuggestions(dto);
  }

  @Patch(':id')
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a category',
    description: 'Updates an existing category. Requires authentication.',
  })
  @ApiResponse({ status: 200, description: 'Category successfully updated.' })
  @ApiResponse({
    status: 400,
    description:
      'Invalid data or attempting to set a category as its own parent.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({
    status: 404,
    description: 'Category or target parent category not found.',
  })
  @ApiResponse({ status: 409, description: 'Name or slug conflict.' })
  public async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(id, updateCategoryDto);
  }

  @Delete(':id')
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a category',
    description:
      'Deletes a category. Child categories will be safely detached (SET NULL). Requires authentication.',
  })
  @ApiResponse({ status: 200, description: 'Category successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  public async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.deleteCategory(id);
  }
}
