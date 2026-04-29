import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class UpdateTodoInput {
  // どのTodoを更新するか指定するためのID
  @Field(() => Int)
  id: number;

  // 更新後のステータス（true か false）
  @Field(() => Boolean, { nullable: true })
  isCompleted?: boolean;

  // タイトル、詳細、期限日も後から変更できるように追加
  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Date, { nullable: true })
  dueDate?: Date;

  // 更新時にタグを付け替えるためのID配列
  @Field(() => [Int], { nullable: true })
  tagIds?: number[];
}