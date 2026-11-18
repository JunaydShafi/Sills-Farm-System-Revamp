import "server-only";

// Centralized throttling policies for sensitive API endpoints.
// All windows are measured in seconds.
export const API_RATE_LIMITS = Object.freeze({
  // Shared allowance across User Management operations.
  // Each authenticated Administrator gets an independent counter.
  userManagement: Object.freeze({
    limit: 45,
    windowSeconds: 60,
  }),

  // Public login requests, separate from the existing
  // 5-failed-attempts-per-username lockout.
  login: Object.freeze({
    limit: 10,
    windowSeconds: 60,
  }),

  // Reserved for future password-recovery endpoints.
  // These policies are NOT active until integrated.
  passwordRecoveryRequest: Object.freeze({
    limit: 3,
    windowSeconds: 900,
  }),

  passwordRecoveryReset: Object.freeze({
    limit: 5,
    windowSeconds: 900,
  }),
});
