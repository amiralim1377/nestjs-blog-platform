export class UserCreatedEvent {
  public static readonly EVENT_NAME = 'user.created';

  constructor(
    public readonly email: string,
    public readonly firstName?: string,
  ) {}
}
