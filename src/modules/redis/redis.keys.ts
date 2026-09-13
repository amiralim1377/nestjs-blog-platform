export const RedisKeys = {
  /**
   *
   * @example 'blacklist:eyJhbGci...'
   */
  blacklistToken: (token: string) => `blacklist:${token}`,

  // 💡 مثال برای آینده: اگر خواستید پروفایل یوزر را کش کنید
  // userProfile: (userId: number) => `user:profile:${userId}`,

  // 💡 مثال برای آینده: محدود کردن تعداد درخواست‌ها (Rate Limiting)
  // rateLimit: (ip: string) => `rate-limit:${ip}`,
};
