// Centralized query keys for React Query
// This provides type-safe keys and easy invalidation

export const queryKeys = {
  // Profile
  profile: () => ["profile"] as const,
  profileById: (userId: string) => ["profile", userId] as const,

  // Professionals
  professionals: {
    all: () => ["professionals"] as const,
    lists: () => ["professionals", "list"] as const,
    list: (type: "browse" | "discover") =>
      ["professionals", "list", type] as const,
    details: () => ["professionals", "detail"] as const,
    detail: (id: string) => ["professionals", "detail", id] as const,
  },

  // My Publications
  myPublications: {
    all: () => ["my-publications"] as const,
    lists: () => ["my-publications", "list"] as const,
    list: (userId?: string) =>
      userId
        ? (["my-publications", "list", userId] as const)
        : (["my-publications", "list"] as const),
    details: () => ["my-publications", "detail"] as const,
    detail: (id: string) => ["my-publications", "detail", id] as const,
  },

  // Portfolio
  portfolio: {
    all: () => ["portfolio"] as const,
    lists: () => ["portfolio", "list"] as const,
    list: (profileId: string) => ["portfolio", "list", profileId] as const,
    details: () => ["portfolio", "detail"] as const,
    detail: (photoId: string) => ["portfolio", "detail", photoId] as const,
  },

  // Reviews
  reviews: {
    all: () => ["reviews"] as const,
    lists: () => ["reviews", "list"] as const,
    list: (profileId: string) => ["reviews", "list", profileId] as const,
    average: (profileId: string) => ["reviews", "average", profileId] as const,
  },

  // Onboarding
  onboarding: {
    status: () => ["onboarding", "status"] as const,
  },
};

// Type helper for query key arrays
export type QueryKey = ReturnType<(typeof queryKeys)[keyof typeof queryKeys]>;
