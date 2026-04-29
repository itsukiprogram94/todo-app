import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Tag {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  color?: string;
}