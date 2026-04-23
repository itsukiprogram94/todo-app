// backend/src/todo/dto/create-todo.input.ts
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateTodoInput {
  @Field(() => String)
  title: string; // お客さんからは「title」という文字だけを受け取ります
}
