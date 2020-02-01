export interface Token {
  jwt: string;
  jwt_exp: string;
  rt: string;
  rt_exp: string;
}

export class TokenManager {
  protected setTokenInfo(token: Token) {
    window.localStorage.setItem('rt', token.rt);
    window.localStorage.setItem('rt_exp', token.rt_exp);
    window.localStorage.setItem('jwt_exp', token.jwt_exp);
  }

  protected clearTokenInfo() {
    window.localStorage.removeItem('rt');
    window.localStorage.removeItem('rt_exp');
    window.localStorage.removeItem('jwt_exp');
  }
}
