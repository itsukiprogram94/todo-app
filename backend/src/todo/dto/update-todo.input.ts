import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class UpdateTodoInput {
  // どのTodoを更新するか指定するためのID
  @Field(() => Int)
  id: number;

  // 更新後のステータス（true か false）
  @Field(() => Boolean)
  isCompleted: boolean;
}