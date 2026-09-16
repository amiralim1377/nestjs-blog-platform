export class UserCreatedEvent {
  public static readonly name = 'user.created';

  constructor(
    public readonly email: string,
    public readonly firstName?: string,
  ) {}
}
