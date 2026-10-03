export interface CustomerAccessPayload {
  sub: string;
  phone: string;
}

export interface CustomerRefreshPayload {
  sub: string;
  tokenVersion: string;
}

export interface RequestCustomer extends CustomerAccessPayload {
  customerId: string;
}
