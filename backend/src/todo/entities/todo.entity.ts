// backend/src/todo/entities/todo.entity.ts
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Tag } from '../../tag/tag.entity';

@ObjectType()
export class Todo {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  title: string;

  @Field(() => Boolean)
  isCompleted: boolean;

  @Field(() => String, {nullable: true })
  description?: string;

  @Field(() => Date, {nullable: true })
  dueDate?: Date;

  // ★新機能：このTodoに紐づいているタグのリスト（配列）
  @Field(() => [Tag], { nullable: true })
  tags?: Tag[];
}