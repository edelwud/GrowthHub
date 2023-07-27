import { Module } from "@nestjs/common";
import { StaffModule } from "./staff/staff.module";

@Module({
  imports: [StaffModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
