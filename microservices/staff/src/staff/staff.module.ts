import { ApolloServerPluginInlineTrace } from "@apollo/server/plugin/inlineTrace";
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { StaffResolver } from "./staff.resolver";
import { StaffService } from "./staff.service";

@Module({
  providers: [StaffResolver, StaffService],
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: true,
      plugins: [ApolloServerPluginInlineTrace()],
    }),
  ],
})
export class StaffModule {}
