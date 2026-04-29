import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { TagService } from './tag.service';
import { Tag } from './tag.entity';

@Resolver(() => Tag)
export class TagResolver {
  constructor(private readonly tagService: TagService) {}

  @Query(() => [Tag], { name: 'tags' })
  findAll() {
    return this.tagService.findAll();
  }

  @Mutation(() => Tag)
  createTag(
    @Args('name') name: string,
    @Args('color', { nullable: true }) color?: string,
  ) {
    return this.tagService.create(name, color);
  }
}