// User role constants - keep in sync with backend
export const USER_ROLES = {
  JAMB: 'jamb',
  UNDERGRADUATE: 'undergraduate', 
  UNIVERSITY: 'university',
  MASTERS: 'masters',
  LECTURER: 'lecturer',
  CUSTOM: 'custom',
} as const;

// Default values for onboarding skip
export const DEFAULT_USER_ROLE = USER_ROLES.CUSTOM;
export const DEFAULT_LEARNING_GOAL = 'General learning';

// Valid user roles array for validation
export const VALID_USER_ROLES = Object.values(USER_ROLES);

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
