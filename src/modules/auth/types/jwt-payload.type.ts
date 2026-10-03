export interface JwtAccessPayload {
  sub: string;
  email: string;
  roleKey: string;
  permissions: string[];
}

export interface JwtRefreshPayload {
  sub: string;
  tokenVersion: string;
}

export interface RequestUser extends JwtAccessPayload {
  userId: string;
}
