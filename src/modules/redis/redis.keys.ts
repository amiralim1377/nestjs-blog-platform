export const RedisKeys = {
  /**
   *
   * @example 'blacklist:9a59670a-cbf0-420e-a7ad-deba3fcb1589'
   */
  blacklistToken: (jti: string) => `blacklist:${jti}`,
  getAccountLockoutKey: (email: string) => `account_lockout:${email}`,
};
