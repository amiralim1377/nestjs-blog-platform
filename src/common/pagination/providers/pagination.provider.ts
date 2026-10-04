import { Injectable } from '@nestjs/common';
import { FindManyOptions, ObjectLiteral, Repository } from 'typeorm';
import { PaginationQueryDto } from '../dto/pagination.query.dto.js';
import { Paginated } from '../interfaces/paginated.interface.js';

@Injectable()
export class PaginationProvider {
  public async paginateQuery<T extends ObjectLiteral>(
    paginationQuery: PaginationQueryDto,
    repository: Repository<T>,
    currentUrl: string,
    options?: FindManyOptions<T>,
  ): Promise<Paginated<T>> {
    const page = paginationQuery.page ?? 1;
    const limit = paginationQuery.limit ?? 5;

    const results = await repository.find({
      ...options,
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalItems = await repository.count({
      where: options?.where,
    });

    const totalPages = Math.ceil(totalItems / limit);

    const nextPage = page === totalPages ? page : page + 1;
    const previousPage = page === 1 ? page : page - 1;

    const buildUrl = (targetPage: number) =>
      `${currentUrl}?limit=${limit}&page=${targetPage}`;

    const finalResponse: Paginated<T> = {
      data: results,
      meta: {
        itemsPerPage: limit,
        totalItems: totalItems,
        currentPage: page,
        totalPages: totalPages,
      },
      links: {
        first: buildUrl(1),
        last: buildUrl(totalPages),
        current: buildUrl(page),
        next: buildUrl(nextPage),
        previous: buildUrl(previousPage),
      },
    };

    return finalResponse;
  }
}
