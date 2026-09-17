import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Tag } from '../../entities/tag.entity.js';

@Injectable()
export class FindOrCreateTagsProvider {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  public async findOrCreate(tagNames: string[]): Promise<Tag[]> {
    // 1. Return early if no tags are provided
    if (!tagNames || tagNames.length === 0) {
      return [];
    }

    // 2. Normalize tags (trim spaces and convert to lowercase for consistency)
    // Example: "  NestJS " -> "nestjs"
    const normalizedNames = tagNames.map((name) => name.trim().toLowerCase());

    // 3. Fetch all tags that already exist in the database
    const existingTags = await this.tagRepository.find({
      where: {
        name: In(normalizedNames), // typeorm 'In' operator for array matching
      },
    });

    // Extract names of existing tags to compare
    const existingTagNames = existingTags.map((tag) => tag.name.toLowerCase());

    // 4. Filter out the tag names that do NOT exist in the database
    const missingTagNames = normalizedNames.filter(
      (name) => !existingTagNames.includes(name),
    );

    // 5. Create and save the missing tags in bulk
    let newTags: Tag[] = [];
    if (missingTagNames.length > 0) {
      const tagsToCreate = missingTagNames.map((name) => {
        // Create entity instance for each missing tag
        return this.tagRepository.create({
          name: name,
          slug: name.replace(/\s+/g, '-'),
        });
      });

      // Save all new tags to database in a single query (Bulk Insert)
      newTags = await this.tagRepository.save(tagsToCreate);
    }

    // 6. Return the combined result (existing + newly created tags)
    return [...existingTags, ...newTags];
  }
}
