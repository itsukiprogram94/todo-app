// backend/src/todo/dto/create-todo.input.ts
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateTodoInput {
  @Field(() => String)
  title: string; // お客さんからは「title」という文字だけを受け取ります
  
  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Date, { nullable: true })
  dueDate?: Date;

  // 紐づけたいタグのIDの配列（空っぽでもOK）
  @Field(() => [Int], { nullable: true })
  tagIds?: number[];


}
