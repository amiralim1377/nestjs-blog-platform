import { Module } from '@nestjs/common';
import { TagsService } from './providers/tags.service.js';
import { TagsController } from './tags.controller.js';
import { CreateTagProvider } from './providers/actions/create-tag.provider.js';
import { UpdateTagProvider } from './providers/actions/update-tag.provider.js';
import { Tag } from './entities/tag.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeleteTagProvider } from './providers/actions/delete-tag.provider.js';

@Module({
  imports: [TypeOrmModule.forFeature([Tag])],
  controllers: [TagsController],
  providers: [
    TagsService,
    CreateTagProvider,
    UpdateTagProvider,
    DeleteTagProvider,
  ],
})
export class TagsModule {}
