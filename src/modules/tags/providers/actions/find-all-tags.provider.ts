import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from '../../entities/tag.entity.js';
import { Repository, ILike } from 'typeorm';
import { GetTagDto } from '../../dto/get-tags.dto.js';
import { PaginationProvider } from '../../../../common/pagination/providers/pagination.providers.js';

@Injectable()
export class FindAllTagProvider {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    private readonly paginationProvider: PaginationProvider,
  ) {}

  public async findAllTag(getTagsDto: GetTagDto, currentUrl: string) {
    const whereConditions: any = {};
    if (getTagsDto.search) {
      whereConditions.name = ILike(`%${getTagsDto.search}%`);
    }

    return await this.paginationProvider.paginateQuery(
      getTagsDto,
      this.tagRepository,
      currentUrl,
      {
        where: whereConditions,
        order: { createdAt: 'DESC' },
      },
    );
  }
}
