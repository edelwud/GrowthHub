import { Args, Info, Query, Resolver } from "@nestjs/graphql";
import { PrismaSelect } from "@paljs/plugins";
import { PrismaClient } from "@prisma/client";
import { GraphQLResolveInfo } from "graphql/type";
import { AggregateStaff } from "../@generated/staff/aggregate-staff.output";
import { StaffAggregateArgs } from "../@generated/staff/staff-aggregate.args";
import { StaffWhereInput } from "../@generated/staff/staff-where.input";
import { Staff } from "../@generated/staff/staff.model";

const prisma = new PrismaClient();

@Resolver(() => Staff)
export class StaffResolver {
  @Query(() => [Staff])
  async staffs(
    @Args("where") where: StaffWhereInput,
    @Info() info: GraphQLResolveInfo,
  ) {
    const select = new PrismaSelect(info).value;
    return prisma.staff.findMany({ where, ...select });
  }

  @Query(() => AggregateStaff)
  staffAggregate(@Args() args: StaffAggregateArgs) {
    return prisma.staff.aggregate(args);
  }
}
