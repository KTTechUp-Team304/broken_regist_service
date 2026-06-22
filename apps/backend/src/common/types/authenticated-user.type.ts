import { UserRole } from '../../users/entities/user.entity';

export type AuthenticatedUser = {
  id: number;
  username: string;
  role: UserRole;
};
