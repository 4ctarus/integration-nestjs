export type IEmail = {
  id: string;
  address: string;
};

export type IEmailFilters = {
  address?: { equal: string; in: string[] } | null;
};

export type EmailId = IEmail['id'];
export type EmailAddress = IEmail['address'];
