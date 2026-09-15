export const RedisKeys = {
  /**
   * @example 'blacklist:9a59670a-cbf0-420e-a7ad-deba3fcb1589'
   */
  blacklistToken: (jti: string) => `blacklist:${jti}`,

  /**
   * @example 'account_lockout:user@example.com'
   */
  getAccountLockoutKey: (email: string) => `account_lockout:${email}`,

  /**
   * @example 'reset_password_token:a1b2c3d4e5...'
   */
  resetPasswordToken: (token: string) => `reset_password_token:${token}`,
};
