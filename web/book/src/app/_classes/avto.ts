export interface AvtoStruct {
  avto_id?: number;
  user_id?: number;
  name: string;
  odo: number;
  avatar?: boolean;
}

export class Avto {
  avto_id: number;
  name: string;
  odo: number;
  avatar: boolean;
  private cache: number;

  constructor(data: AvtoStruct) {
    this.avto_id = data.avto_id;
    this.update(data.name, data.odo, data.avatar);
  }

  update(name: string, odo: number, avatar: boolean) {
    this.name = name;
    this.odo = odo;
    this.avatar = avatar;
    this.cache = Date.now();
  }

  get avatarSmallPath(): string {
    if (!this.avatar) {
      return '/assets/images/no_photo_small.png';
    }
    return `/api/images/small/${this.avto_id}.jpg?t=${this.cache}`;
  }

  get avatarMediumPath(): string {
    if (!this.avatar) {
      return '/assets/images/no_photo.png';
    }
    return `/api/images/medium/${this.avto_id}.jpg?t=${this.cache}`;
  }
}
