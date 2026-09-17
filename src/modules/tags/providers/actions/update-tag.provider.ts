import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../../entities/tag.entity.js';
import { UpdateTagDto } from '../../dto/update-tag.dto.js';

@Injectable()
export class UpdateTagProvider {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  public async updateTag(tagId: number, updateTagDto: UpdateTagDto) {
    const tag = await this.tagRepository.preload({
      id: tagId,
      ...updateTagDto,
    });

    if (!tag) {
      throw new NotFoundException(`تگی با شناسه ${tagId} یافت نشد.`);
    }

    return await this.tagRepository.save(tag);
  }
}
