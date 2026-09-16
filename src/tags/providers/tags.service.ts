import { Injectable } from '@nestjs/common';
import { CreateTagDto } from '../dto/create-tag.dto.js';
import { CreateTagProvider } from './actions/create-tag.provider.js';
import { UpdateTagDto } from '../dto/update-tag.dto.js';
import { UpdateTagProvider } from './actions/update-tag.provider.js';

@Injectable()
export class TagsService {
  constructor(
    private readonly createTagProvider: CreateTagProvider,
    private readonly updateTagProvider: UpdateTagProvider,
  ) {}

  async createTag(createTagDto: CreateTagDto) {
    return await this.createTagProvider.createTag(createTagDto);
  }

  async updateTag(tagId: number, updateTagDto: UpdateTagDto) {
    return await this.updateTagProvider.updateTag(tagId, updateTagDto);
  }
}
