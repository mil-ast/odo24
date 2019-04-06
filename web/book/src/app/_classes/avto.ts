export interface AvtoStruct {
    avto_id?: number;
    user_id?: number;
    name: string;
    odo: number;
    avatar?: boolean;
    public?: boolean;
    cacheImg?: number;
}

export class Avto {
    avto_id: number;
    name: string;
    odo: number;
    avatar: boolean;
    avatar_time_cache = 1;

    constructor(id: number, name: string, odo: number, avatar: boolean) {
        this.avto_id = id;
        this.Update(name, odo, avatar);
    }

    Update(name: string, odo: number, avatar: boolean) {
        this.name = name;
        this.odo = odo | 0;
        this.avatar = avatar;
    }

    SetCacheValue(value: number) {
        this.avatar_time_cache = value;
    }
}
