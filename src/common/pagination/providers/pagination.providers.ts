import { Inject, Injectable } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';
import { PaginationQueryDto } from '../dto/pagination.query.dto.js';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { Paginated } from '../interfaces/paginated.interface.js';

@Injectable()
export class PaginationProvider {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  public async paginateQuery<T extends ObjectLiteral>(
    paginationQuery: PaginationQueryDto,
    repository: Repository<T>,
  ): Promise<Paginated<T>> {
    const page = paginationQuery.page ?? 1;
    const limit = paginationQuery.limit ?? 10;

    const results = await repository.find({
      skip: (page - 1) * limit,
      take: limit,
    });

    const baseURL =
      this.request.protocol + '://' + this.request.headers.host + '/';
    const newUrl = new URL(this.request.url, baseURL);

    /**
     * create the request URLS
     */
    const totalItems = await repository.count();
    const totalPages = Math.ceil(totalItems / limit);

    const nextPage = page === totalPages ? page : page + 1;
    const previousPage = page === 1 ? page : page - 1;

    const finalResponse: Paginated<T> = {
      data: results,
      meta: {
        itemsPerPage: limit,
        totalItems: totalItems,
        currentPage: page,
        totalPages: totalPages,
      },
      links: {
        first: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=1`,
        last: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${totalPages}`,
        current: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${page}`,
        next: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${nextPage}`,
        previous: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${previousPage}`,
      },
    };

    return finalResponse;
  }
}
