import { Args, ID, Query, Resolver, ResolveReference } from "@nestjs/graphql";
import { Staff } from "./models/staff.model";
import { StaffService } from "./staff.service";

@Resolver(() => Staff)
export class StaffResolver {
  constructor(private staffService: StaffService) {}

  @Query(() => Staff)
  getUser(@Args({ name: "id", type: () => ID }) id: number): Staff | undefined {
    return this.staffService.findById(id);
  }

  @ResolveReference()
  resolveReference(reference: {
    __typename: string;
    id: number;
  }): Staff | undefined {
    return this.staffService.findById(reference.id);
  }
}
