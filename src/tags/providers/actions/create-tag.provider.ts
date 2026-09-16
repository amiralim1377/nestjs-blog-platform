import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../../entities/tag.entity.js';
import { CreateTagDto } from '../../dto/create-tag.dto.js';
import { tryCatch } from 'bullmq';

@Injectable()
export class CreateTagProvider {
  private readonly logger = new Logger(CreateTagProvider.name);

  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  public async createTag(createTagDto: CreateTagDto) {
    try {
      const newTag = this.tagRepository.create(createTagDto);
      return await this.tagRepository.save(newTag);
    } catch (error) {
      this.logger.error(`Error creating tag: ${createTagDto.name}`, error);
      throw new InternalServerErrorException(
        'Failed to create the tag due to a database error.',
      );
    }
  }
}
