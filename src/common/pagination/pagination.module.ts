import { Module } from '@nestjs/common';
import { PaginationProvider } from './providers/pagination.providers.js';

@Module({
  providers: [PaginationProvider],
  exports: [PaginationProvider],
})
export class PaginationModule {}
