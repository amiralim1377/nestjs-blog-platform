import { Module } from '@nestjs/common';
import { TagsService } from './providers/tags.service.js';
import { TagsController } from './tags.controller.js';
import { CreateTagProvider } from './providers/actions/create-tag.provider.js';
import { UpdateTagProvider } from './providers/actions/update-tag.provider.js';
import { Tag } from './entities/tag.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Tag])],
  controllers: [TagsController],
  providers: [TagsService, CreateTagProvider, UpdateTagProvider],
})
export class TagsModule {}
