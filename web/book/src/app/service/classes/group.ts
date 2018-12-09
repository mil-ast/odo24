import { Service } from './service';

export class Group {
  group_id: number;
  name: string;
  order: number;
  global: boolean;
  services: Service[];

  constructor(id: number, name: string, global: boolean, services: Service[]) {
    this.group_id = id;
    this.name = name;
    this.global = global;
    this.services = services || [];
  }

  Update(name: string) {
    this.name = name;
  }
}
