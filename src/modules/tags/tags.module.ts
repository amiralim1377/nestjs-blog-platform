import { Module } from '@nestjs/common';
import { TagsService } from './providers/tags.service.js';
import { TagsController } from './tags.controller.js';
import { CreateTagProvider } from './providers/actions/create-tag.provider.js';
import { UpdateTagProvider } from './providers/actions/update-tag.provider.js';
import { Tag } from './entities/tag.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeleteTagProvider } from './providers/actions/delete-tag.provider.js';
import { FindAllTagProvider } from './providers/actions/find-all-tags.provider.js';
import { PaginationModule } from '../../common/pagination/pagination.module.js';
import { FindOrCreateTagsProvider } from './providers/actions/find-or-create.provider.js';

@Module({
  imports: [TypeOrmModule.forFeature([Tag]), PaginationModule],
  controllers: [TagsController],
  providers: [
    TagsService,
    CreateTagProvider,
    UpdateTagProvider,
    DeleteTagProvider,
    FindAllTagProvider,
    FindOrCreateTagsProvider,
  ],

  exports: [TagsService],
})
export class TagsModule {}
