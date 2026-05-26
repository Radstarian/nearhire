import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET ?? 'nearhire-secret';

export function signJwt(payload: Record<string, unknown>) {
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export function verifyJwt(token: string) {
  return jwt.verify(token, secret);
}
