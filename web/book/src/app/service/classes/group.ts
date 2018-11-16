import { Service } from './service';

export class Group {
    group_id: number;
    name: string;
    own: string;
    services: Service[];

    constructor(id: number, name: string, own: string, services: Service[]) {
        this.group_id = id;
        this.name = name;
        this.own = own || 'GLOBAL';
        this.services = services||[];
    }

    Update(name: string) {
        this.name = name;
    }
}