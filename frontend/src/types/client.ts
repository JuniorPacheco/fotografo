export interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string | null;
  cedula: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientRequest {
  name: string;
  phone: string;
  address: string;
  email?: string;
  cedula?: string;
}

export interface UpdateClientRequest {
  name?: string;
  phone?: string;
  address?: string;
  email?: string | null;
  cedula?: string | null;
}

export interface ClientsResponse {
  success: boolean;
  data: {
    clients: Client[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

export interface ClientResponse {
  success: boolean;
  data: {
    client: Client;
  };
}
