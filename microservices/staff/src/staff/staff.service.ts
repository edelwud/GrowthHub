import { Injectable } from "@nestjs/common";
import { Staff } from "./models/staff.model";

@Injectable()
export class StaffService {
  private staff: Staff[] = [
    { id: 1, name: "John Doe", email: "example@email.com" },
    { id: 2, name: "Richard Roe", email: "example@email.com" },
  ];

  findById(id: number): Staff | undefined {
    return this.staff.find((staff) => staff.id === Number(id));
  }
}
