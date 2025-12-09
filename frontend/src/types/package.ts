export interface Package {
  id: string;
  name: string;
  suggestedPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePackageRequest {
  name: string;
  suggestedPrice: number;
}

export interface UpdatePackageRequest {
  name?: string;
  suggestedPrice?: number;
}

export interface PackagesResponse {
  success: boolean;
  data: {
    packages: Package[];
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

export interface PackageResponse {
  success: boolean;
  data: {
    package: Package;
  };
}
