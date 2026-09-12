import * as argon2 from 'argon2';
import { HashingProvider } from './hashing.provider.js';

export class ArgonProvider implements HashingProvider {
  async hashPassword(data: string | Buffer): Promise<string> {
    return await argon2.hash(data);
  }

  async comparePassword(
    data: string | Buffer,
    encrypted: string,
  ): Promise<boolean> {
    return await argon2.verify(encrypted, data);
  }
}
