import { Injectable } from '@nestjs/common';
import { CreateTagDto } from '../dto/create-tag.dto.js';
import { CreateTagProvider } from './actions/create-tag.provider.js';
import { UpdateTagDto } from '../dto/update-tag.dto.js';
import { UpdateTagProvider } from './actions/update-tag.provider.js';
import { DeleteTagProvider } from './actions/delete-tag.provider.js';
import { GetTagDto } from '../dto/get-tags.dto.js';
import { FindAllTagProvider } from './actions/find-all-tags.provider.js';
import { FindOrCreateTagsProvider } from './actions/find-or-create.provider.js';

@Injectable()
export class TagsService {
  constructor(
    private readonly createTagProvider: CreateTagProvider,
    private readonly updateTagProvider: UpdateTagProvider,
    private readonly deleteTagProvider: DeleteTagProvider,
    private readonly findAllTagProvider: FindAllTagProvider,
    private readonly findOrCreateTagsProvider: FindOrCreateTagsProvider,
  ) {}

  async createTag(createTagDto: CreateTagDto) {
    return await this.createTagProvider.createTag(createTagDto);
  }

  async updateTag(tagId: number, updateTagDto: UpdateTagDto) {
    return await this.updateTagProvider.updateTag(tagId, updateTagDto);
  }

  async delete(tagId: number) {
    return await this.deleteTagProvider.deleteTag(tagId);
  }

  async findAll(getTagsDto: GetTagDto, currentUrl: string) {
    return await this.findAllTagProvider.findAllTag(getTagsDto, currentUrl);
  }

  public async findOrCreateMultiple(tagNames: string[]) {
    return await this.findOrCreateTagsProvider.findOrCreate(tagNames);
  }
}
