export interface MainResponse<T> {
  data: T;
  error: T;
  status: number;
  description: string;
  timestamp: string;
  path: string;
  successfulRequest: boolean;
}

export interface ErrorResponse {
  error: boolean;
  detail: string;
}

export interface LoginRes {
  access_token: string;
  refresh_token: string;
}

export interface DecodedUserData {
  user_id?: number;
  first_name?: string;
  last_name?: string;
  iat?: number;
  exp?: number;
  letter?: string;
  isLogged: boolean;
}

export interface LoginWithAzureAdRes {
  authUrl: string;
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}
