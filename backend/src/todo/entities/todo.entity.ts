// backend/src/todo/entities/todo.entity.ts
import { ObjectType, Field, Int } from '@nestjs/graphql';

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
}