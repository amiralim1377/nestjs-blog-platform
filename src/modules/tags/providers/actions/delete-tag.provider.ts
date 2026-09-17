import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from '../../entities/tag.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class DeleteTagProvider {
  private readonly logger = new Logger(DeleteTagProvider.name);

  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async deleteTag(tagId: number): Promise<void> {
    const tag = await this.tagRepository.findOne({
      where: { id: tagId },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    await this.tagRepository.delete(tagId);

    this.logger.log(`Tag with ID ${tagId} deleted successfully`);
  }
}
