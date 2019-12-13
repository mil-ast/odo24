export class Profile {
  user_id: number;
  login: string;
  confirmed: boolean;

  constructor(data: any) {
    this.user_id = data.user_id | 0;
    this.login = data.login || null;
    this.confirmed = !!data.confirmed;
  }
}
