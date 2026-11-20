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

  // ======================================================
  // Email verification
  // ======================================================

  // Limit verification emails requested for a target account.
  // Shared between employee and Administrator requests.
  emailVerificationRecipient: Object.freeze({
    limit: 3,
    windowSeconds: 3600,
  }),

  // Limit how many verification requests an authenticated
  // user or Administrator can initiate.
  emailVerificationRequester: Object.freeze({
    limit: 10,
    windowSeconds: 3600,
  }),

  // Limit verification confirmation attempts per user.
  emailVerificationConfirm: Object.freeze({
    limit: 10,
    windowSeconds: 60,
  }),

  // ======================================================
  // Password recovery
  // ======================================================

  // Limit password recovery requests.
  passwordRecoveryRequest: Object.freeze({
    limit: 3,
    windowSeconds: 900,
  }),

  // Limit password reset submission attempts.
  passwordRecoveryReset: Object.freeze({
    limit: 5,
    windowSeconds: 900,
  }),

  // ======================================================
  // Shared email delivery protection
  // ======================================================

  // Minimum interval between email sending attempts
  // for the same account across recovery operations.
  emailSendCooldown: Object.freeze({
    limit: 1,
    windowSeconds: 60,
  }),

  // Shared application-wide email sending allowance.
  // Protects the email provider's sending quota.
  emailDeliveryGlobal: Object.freeze({
    limit: 80,
    windowSeconds: 86400,
  }),
});
