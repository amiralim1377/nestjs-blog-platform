import { UserRole } from '../../users/enums/user-role.enum.js';

export interface ActiveUserData {
  /**
   * The ID of the user
   */
  sub: string;

  /**
   * User's email address
   */
  email: string;

  /**
   * User's role in the system
   */
  role?: UserRole;
}
