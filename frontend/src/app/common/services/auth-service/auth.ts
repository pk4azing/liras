export interface UserCredentials {
  email: string;
  password: string;
}

export interface LoggedInUser {
  id: number;
  token: string;
  username: string;
  email: string;
  phone: string;
}
