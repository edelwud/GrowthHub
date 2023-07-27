import { ApolloServerPluginInlineTrace } from "@apollo/server/plugin/inlineTrace";
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { StaffResolver } from "./staff.resolver";

@Module({
  providers: [StaffResolver],
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: { federation: 2 },
      plugins: [ApolloServerPluginInlineTrace()],
    }),
  ],
})
export class StaffModule {}
