import "server-only";
import { prisma } from "@/lib/prisma";
import { checkApiRateLimit } from "@/lib/apiRateLimit";
import { API_RATE_LIMITS } from "@/lib/apiRateLimitConfig";
import { sendEmail } from "@/lib/emailService";
import { TOKEN_PURPOSES } from "@/lib/emailTokens";
import { issueEmailToken } from "@/lib/emailTokenService";

// ======================================================
// Application URL configuration
// ======================================================

// Construct verification links using a trusted,
// server-controlled application URL.
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
      throw new Error("Production application URL must use HTTPS.");
    }
  } else if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Invalid application URL protocol.");
  }

  return url.origin;
}

// ======================================================
// Email verification request
// ======================================================

// Shared service for employee and Administrator
// email verification requests.
export async function requestEmailVerification({
  requesterId,
  targetUserId,
}) {
  if (
    !Number.isSafeInteger(requesterId) ||
    requesterId <= 0 ||
    !Number.isSafeInteger(targetUserId) ||
    targetUserId <= 0
  ) {
    return {
      success: false,
      status: 400,
      error: "Invalid user ID.",
    };
  }

  // Verify the requesting account.
  const requester = await prisma.users.findUnique({
    where: {
      id: requesterId,
    },
    select: {
      id: true,
      role: true,
      status: true,
    },
  });

  if (!requester || requester.status !== "Active") {
    return {
      success: false,
      status: 403,
      error: "Access denied.",
    };
  }

  // Employees may only request their own verification.
  // Administrators may request verification for others.
  if (
    requesterId !== targetUserId &&
    requester.role !== "Administrator"
  ) {
    return {
      success: false,
      status: 403,
      error: "Access denied.",
    };
  }

  // ====================================================
  // Requester throttling
  // ====================================================

  const requesterLimit = await checkApiRateLimit({
    key: `email-verification:requester:${requesterId}`,
    ...API_RATE_LIMITS.emailVerificationRequester,
  });

  if (!requesterLimit.allowed) {
    return {
      success: false,
      status: 429,
      rateLimit: requesterLimit,
    };
  }

  // ====================================================
  // Target account eligibility
  // ====================================================

  const targetUser = await prisma.users.findUnique({
    where: {
      id: targetUserId,
    },
    select: {
      id: true,
      email: true,
      email_verified_at: true,
      status: true,
      is_owner: true,
    },
  });

  if (!targetUser) {
    return {
      success: false,
      status: 404,
      error: "User not found.",
    };
  }

  // Only the System Owner may request verification
  // for the protected owner account.
  if (
    targetUser.is_owner &&
    requesterId !== targetUser.id
  ) {
    return {
      success: false,
      status: 403,
      error: "This account is protected.",
    };
  }

  if (targetUser.status !== "Active") {
    return {
      success: false,
      status: 400,
      error: "Inactive accounts cannot verify email addresses.",
    };
  }

  if (!targetUser.email) {
    return {
      success: false,
      status: 400,
      error: "No email address is assigned to this account.",
    };
  }

  if (targetUser.email_verified_at) {
    return {
      success: false,
      status: 400,
      error: "This email address is already verified.",
    };
  }

  // Check email configuration before issuing tokens.
  if (
    process.env.EMAIL_ENABLED !== "true" ||
    !process.env.RESEND_API_KEY ||
    !process.env.EMAIL_FROM
  ) {
    return {
      success: false,
      status: 503,
      error: "Email delivery is currently unavailable.",
    };
  }

  const baseUrl = getApplicationBaseUrl();

  // ====================================================
  // Shared account email cooldown
  // ====================================================

  const cooldownLimit = await checkApiRateLimit({
    key: `email-delivery:cooldown:${targetUserId}`,
    ...API_RATE_LIMITS.emailSendCooldown,
  });

  if (!cooldownLimit.allowed) {
    return {
      success: false,
      status: 429,
      rateLimit: cooldownLimit,
    };
  }

  // ====================================================
  // Recipient throttling
  // ====================================================

  const recipientLimit = await checkApiRateLimit({
    key: `email-verification:recipient:${targetUserId}`,
    ...API_RATE_LIMITS.emailVerificationRecipient,
  });

  if (!recipientLimit.allowed) {
    return {
      success: false,
      status: 429,
      rateLimit: recipientLimit,
    };
  }

  // ====================================================
  // Global email delivery protection
  // ====================================================

  const globalLimit = await checkApiRateLimit({
    key: "email-delivery:global",
    ...API_RATE_LIMITS.emailDeliveryGlobal,
  });

  if (!globalLimit.allowed) {
    return {
      success: false,
      status: 429,
      rateLimit: globalLimit,
    };
  }

  // ====================================================
  // Generate a secure verification token
  // ====================================================

  const issuedToken = await issueEmailToken({
    userId: targetUserId,
    email: targetUser.email,
    purpose: TOKEN_PURPOSES.EMAIL_VERIFICATION,
  });

  if (!issuedToken) {
    return {
      success: false,
      status: 409,
      error: "Account information changed. Please try again.",
    };
  }

  // ====================================================
  // Construct the verification link
  // ====================================================

  const verificationUrl = new URL(
    "/verify-email",
    baseUrl
  );

  verificationUrl.hash = new URLSearchParams({
    token: issuedToken.token,
    }).toString();

  const verificationLink = verificationUrl.toString();

  // ====================================================
  // Deliver the verification email
  // ====================================================

  const delivery = await sendEmail({
    to: issuedToken.email,

    subject:
      "Pleasant Grove Farms - Verify Your Email Address",

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

        <h3>Verify Your Email Address</h3>

        <p>
          A request was made to verify the email address
          associated with your business system account.
        </p>

        <p>
          Verifying your email address allows you to
          securely recover your account if you forget
          your password.
        </p>

        <p style="margin: 28px 0;">
          <a
            href="${verificationLink}"
            style="
              background-color: #315C38;
              color: #ffffff;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              display: inline-block;
            "
          >
            Verify Email Address
          </a>
        </p>

        <p>
          This verification link expires in 24 hours
          and can only be used once.
        </p>

        <p>
          You will need to sign in to your business
          system account to complete verification.
        </p>

        <p>
          If you did not expect this request, you can
          ignore this email or contact your Administrator.
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

Verify Your Email Address

A request was made to verify the email address
associated with your business system account.

Verify your email address using the following link:

${verificationLink}

This link expires in 24 hours and can only be used once.

You must sign in to your business system account
to complete verification.

If you did not expect this request, you can ignore
this email or contact your Administrator.

This is an automated message from the
Pleasant Grove Farms Business Management System.
    `.trim(),
  });

  if (!delivery.success) {
    return {
      success: false,
      status: 503,
      error: "Unable to send verification email. Please try again later.",
    };
  }

  // Never expose the original token in an API response.
  return {
    success: true,
    status: 200,
    message: "Verification email sent successfully.",
  };
}