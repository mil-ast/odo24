export class Profile {
  user_id: number;
  login: string;
  phone: number;
  time_zone: number;

  constructor(data: any) {
    this.user_id = data.user_id | 0;
    this.login = data.login || null;
    this.phone = data.phone | 0;
    this.time_zone = data.time_zone | 10;
  }
}
