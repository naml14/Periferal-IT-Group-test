export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
}

export interface CreateContactDto {
  name: string;
  email: string;
  phone: string;
}
