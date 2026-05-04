import { Resolver, Query, Mutation, Args , Int} from '@nestjs/graphql';
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
  // ★追加：タグを更新する窓口
  @Mutation(() => Tag)
  updateTag(
    @Args('id', { type: () => Int }) id: number, // Int型でIDを受け取る
    @Args('name') name: string,
    @Args('color', { nullable: true }) color?: string,
  ) {
    return this.tagService.updateTag(id, name, color); // さっきServiceで作った処理に渡す
  }

  // ★追加：タグを削除する窓口
  @Mutation(() => Tag)
  deleteTag(
    @Args('id', { type: () => Int }) id: number // Int型でIDを受け取る
  ) {
    return this.tagService.deleteTag(id); // さっきServiceで作った処理に渡す
  }
}