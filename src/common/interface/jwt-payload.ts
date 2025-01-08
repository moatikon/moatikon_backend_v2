export interface JwtPayload {
  email: string;
  isRefreshToken: boolean;
  iat: number;
  exp: number;
}
