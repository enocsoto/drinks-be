export interface JwtPayload {
  sub: string;
  document: number;
  role: string[];
}