export class ForgotPasswordEvent {
  public static readonly EVENT_NAME = 'forgot.password';

  constructor(
    public readonly email: string,
    public readonly firstName: string,
    public readonly resetLink: string,
  ) {}
}
