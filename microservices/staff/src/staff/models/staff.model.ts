import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Directive('@key(fields: "id")')
export class Staff {
  @Field(() => ID)
    id: number;

  @Field()
    name: string;

  @Field()
    email: string;
}
