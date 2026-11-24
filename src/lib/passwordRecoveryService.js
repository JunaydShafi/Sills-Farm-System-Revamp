import "server-only";
import { createHash } from "node:crypto";

import { prisma } from "@/lib/prisma";
import { checkApiRateLimit } from "@/lib/apiRateLimit";
import { API_RATE_LIMITS } from "@/lib/apiRateLimitConfig";
import { getLoginClientIdentifier } from "@/lib/loginClientIdentifier";
import { validateEmail } from "@/lib/emailValidation";
import { sendEmail } from "@/lib/emailService";

import {
  TOKEN_PURPOSES,
  hashEmailToken,
} from "@/lib/emailTokens";

import { issueEmailToken } from "@/lib/emailTokenService";

// ======================================================
// Generic password recovery response
// ======================================================

// Do not disclose whether an account exists or whether
// its email address has been verified.
const RECOVERY_MESSAGE =
  "If an active account with a verified email address exists, a password reset link will be sent to that address.";

function genericRecoveryResponse() {
  return {
    success: true,
    status: 200,
    message: RECOVERY_MESSAGE,
  };
}

// ======================================================
// Rate-limit key generation
// ======================================================

// Hash identifiers to avoid storing raw email addresses
// and client identifiers in the rate-limit table.
function hashIdentifier(value) {
  return createHash("sha256")
    .update(value, "utf8")
    .digest("hex");
}

// ======================================================
// Application URL configuration
// ======================================================

// Use a trusted, server-controlled application URL.
// Never construct recovery links from request headers.
function getApplicationBaseUrl() {
  const configuredUrl = process.env.APP_BASE_URL;

  if (!configuredUrl) {
    throw new Error("APP_BASE_URL is not configured.");
  }

  const url = new URL(configuredUrl);

  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/"
  ) {
    throw new Error("Invalid application base URL.");
  }

  if (process.env.NODE_ENV === "production") {
    if (url.protocol !== "https:") {
      throw new Error(
        "Production application URL must use HTTPS."
      );
    }
  } else if (
    !["http:", "https:"].includes(url.protocol)
  ) {
    throw new Error("Invalid application URL protocol.");
  }

  return url.origin;
}

// ======================================================
// Password recovery request
// ======================================================

export async function requestPasswordRecovery({ email }) {
  // ====================================================
  // Client-based request throttling
  // ====================================================

  // Reuse trusted client identification from login,
  // but maintain a separate recovery request counter.
  const clientIdentifier = getLoginClientIdentifier();

  const clientLimit = await checkApiRateLimit({
    key: `password-recovery:client:${hashIdentifier(
      clientIdentifier
    )}`,
    ...API_RATE_LIMITS.passwordRecoveryRequest,
  });

  if (!clientLimit.allowed) {
    return {
      success: false,
      status: 429,
      rateLimit: clientLimit,
    };
  }

  // ====================================================
  // Validate and normalize the submitted email address
  // ====================================================

  const emailValidation = validateEmail(email);

  if (
    !emailValidation.valid ||
    !emailValidation.email
  ) {
    return {
      success: false,
      status: 400,
      error: "Please enter a valid email address.",
    };
  }

  const cleanEmail = emailValidation.email;

  // ====================================================
  // Email-based request throttling
  // ====================================================

  // Apply this restriction regardless of whether
  // the submitted email belongs to an account.
  const recipientLimit = await checkApiRateLimit({
    key: `password-recovery:recipient:${hashIdentifier(
      cleanEmail
    )}`,
    ...API_RATE_LIMITS.passwordRecoveryRequest,
  });

  if (!recipientLimit.allowed) {
    return genericRecoveryResponse();
  }

  // ====================================================
  // Check email delivery configuration
  // ====================================================

  if (
    process.env.EMAIL_ENABLED !== "true" ||
    !process.env.RESEND_API_KEY ||
    !process.env.EMAIL_FROM
  ) {
    return {
      success: false,
      status: 503,
      error: "Password recovery is currently unavailable.",
    };
  }

  const baseUrl = getApplicationBaseUrl();

  // ====================================================
  // Retrieve the associated user account
  // ====================================================

  const user = await prisma.users.findUnique({
    where: {
      email: cleanEmail,
    },
    select: {
      id: true,
      email: true,
      email_verified_at: true,
      status: true,
    },
  });

  // Password recovery requires an existing,
  // active account with a verified email address.
  if (
    !user ||
    user.status !== "Active" ||
    !user.email_verified_at
  ) {
    return genericRecoveryResponse();
  }

  // ====================================================
  // Shared account email cooldown
  // ====================================================

  const cooldownLimit = await checkApiRateLimit({
    key: `email-delivery:cooldown:${user.id}`,
    ...API_RATE_LIMITS.emailSendCooldown,
  });

  if (!cooldownLimit.allowed) {
    return genericRecoveryResponse();
  }

  // ====================================================
  // Global email delivery protection
  // ====================================================

  const globalLimit = await checkApiRateLimit({
    key: "email-delivery:global",
    ...API_RATE_LIMITS.emailDeliveryGlobal,
  });

  if (!globalLimit.allowed) {
    return genericRecoveryResponse();
  }

  // ====================================================
  // Generate a secure password reset token
  // ====================================================

  const issuedToken = await issueEmailToken({
    userId: user.id,
    email: user.email,
    purpose: TOKEN_PURPOSES.PASSWORD_RESET,
  });

  // Account information may have changed while
  // the request was being processed.
  if (!issuedToken) {
    return genericRecoveryResponse();
  }

  // ====================================================
  // Construct the password reset link
  // ====================================================

  // Store the token in the URL fragment instead of
  // the query string to reduce server-side exposure.
  const resetUrl = new URL(
    "/reset-password",
    baseUrl
  );

  resetUrl.hash = new URLSearchParams({
    token: issuedToken.token,
  }).toString();

  const resetLink = resetUrl.toString();

  // ====================================================
  // Deliver the password recovery email
  // ====================================================

  const delivery = await sendEmail({
    to: issuedToken.email,

    subject:
      "Pleasant Grove Farms - Reset Your Password",

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: auto;
        padding: 24px;
        color: #222222;
      ">
        <h2 style="color: #315C38;">
          Pleasant Grove Farms
        </h2>

        <h3>Reset Your Password</h3>

        <p>
          A password reset was requested for your
          business system account.
        </p>

        <p>
          To create a new password, click the
          button below.
        </p>

        <p style="margin: 28px 0;">
          <a
            href="${resetLink}"
            style="
              background-color: #315C38;
              color: #ffffff;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              display: inline-block;
            "
          >
            Reset Password
          </a>
        </p>

        <p>
          This password reset link expires in
          15 minutes and can only be used once.
        </p>

        <p>
          Your current password will remain unchanged
          until you successfully complete the reset.
        </p>

        <p>
          If you did not request a password reset,
          you can ignore this email or contact
          your Administrator.
        </p>

        <hr style="border: 1px solid #dddddd;" />

        <p style="font-size: 12px; color: #666666;">
          This is an automated message from the
          Pleasant Grove Farms Business Management System.
        </p>
      </div>
    `,

    text: `
Pleasant Grove Farms

Reset Your Password

A password reset was requested for your
business system account.

Reset your password using the following link:

${resetLink}

This link expires in 15 minutes and can only be used once.

Your current password will remain unchanged until
you successfully complete the reset.

If you did not request a password reset, you can
ignore this email or contact your Administrator.

This is an automated message from the
Pleasant Grove Farms Business Management System.
    `.trim(),
  });

  // ====================================================
  // Handle unsuccessful email delivery
  // ====================================================

  if (!delivery.success) {
    // Revoke only the token created by this request.
    // Do not revoke a newer token issued concurrently.
    await prisma.user_email_tokens.updateMany({
      where: {
        token_hash: hashEmailToken(issuedToken.token),
        purpose: TOKEN_PURPOSES.PASSWORD_RESET,
        used_at: null,
        revoked_at: null,
      },
      data: {
        revoked_at: new Date(),
      },
    });

    console.error(
      "Password recovery email delivery was unsuccessful."
    );
  }

  // Never expose account information, delivery status,
  // or the original reset token in the public response.
  return genericRecoveryResponse();
}