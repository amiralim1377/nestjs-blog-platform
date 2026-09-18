import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Post } from '../../entities/post.entity.js';

@Injectable()
export class GenerateSlugProvider {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  /**
   * Normalizes and transforms raw input strings into SEO-friendly, multi-language URL slugs.
   * Supports Latin (English, German with umlaut expansion), Arabic, and Persian characters.
   *
   * @param text Raw title or string to slugify
   * @returns URL-friendly normalized slug
   */
  public slugify(text: string): string {
    if (!text) return '';

    return (
      text
        .toString()
        .toLowerCase()
        .trim()
        // 1. Expand German umlauts and sharp S for international URL compatibility
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        // 2. Standardize Arabic and Persian character variants
        .replace(/ي/g, 'ی')
        .replace(/ك/g, 'ک')
        // 3. Strip Arabic/Persian diacritics (Harakat: Fatha, Damma, Kasra, Tanwin, Shaddah)
        .replace(/[\u064B-\u065F]/g, '')
        // 4. Decompose accented Latin characters (e.g., 'é' -> 'e' + combining acute mark)
        .normalize('NFD')
        // 5. Remove decomposed diacritical marks
        .replace(/[\u0300-\u036f]/g, '')
        // 6. Retain only Unicode letters, numbers, spaces, and hyphens
        .replace(/[^\p{L}\p{N}\s-]/gu, '')
        // 7. Convert whitespaces and underscores to hyphens
        .replace(/[\s_]+/g, '-')
        // 8. Collapse consecutive hyphens into a single hyphen
        .replace(/-+/g, '-')
        // 9. Trim leading and trailing hyphens
        .replace(/^-+|-+$/g, '')
    );
  }

  /**
   * Generates a collision-resistant unique slug by checking against existing database entries.
   * Appends an incremental numeric suffix (e.g., "my-slug-1") if duplicate slugs exist.
   *
   * @param title The post title or requested base string
   * @returns Guaranteed unique slug string
   */
  public async generateUniqueSlug(title: string): Promise<string> {
    let baseSlug = this.slugify(title);

    // Fallback if the title contains only stripped symbols
    if (!baseSlug) {
      baseSlug = `post-${Date.now()}`;
    }

    // 1. Query existing slugs matching the base prefix
    const existingPosts = await this.postRepository.find({
      where: { slug: Like(`${baseSlug}%`) },
      select: { slug: true },
    });

    if (existingPosts.length === 0) {
      return baseSlug;
    }

    const existingSlugsSet = new Set(existingPosts.map((post) => post.slug));

    // Return immediately if the exact base slug is available
    if (!existingSlugsSet.has(baseSlug)) {
      return baseSlug;
    }

    // 2. Resolve collisions in-memory to minimize database roundtrips
    let counter = 1;
    let candidateSlug = `${baseSlug}-${counter}`;

    while (existingSlugsSet.has(candidateSlug)) {
      counter++;
      candidateSlug = `${baseSlug}-${counter}`;
    }

    return candidateSlug;
  }
}
