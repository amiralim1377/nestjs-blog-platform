import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { TagsService } from './providers/tags.service.js';
import { CreateTagDto } from './dto/create-tag.dto.js';
import { UpdateTagDto } from './dto/update-tag.dto.js';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Auth } from '../modules/auth/decorator/auth.decorator.js';
import { AuthType } from '../modules/auth/enums/auth-type.enum.js';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new tag (Admin/Author only)' })
  @ApiResponse({
    status: 201,
    description: 'The tag has been successfully created.',
  })
  @ApiResponse({
    status: 409,
    description: 'A tag with this name or slug already exists.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed (e.g., invalid slug format).',
  })
  public async createTag(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.createTag(createTagDto);
  }

  @Patch(':id')
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing tag (Admin/Author only)' })
  @ApiResponse({
    status: 200,
    description: 'The tag has been successfully updated.',
  })
  @ApiResponse({
    status: 404,
    description: 'Tag not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'A tag with this name or slug already exists.',
  })
  public async updateTag(
    @Param('id', ParseIntPipe) tagId: number,
    @Body() updateTagDto: UpdateTagDto,
  ) {
    return this.tagsService.updateTag(tagId, updateTagDto);
  }
}
