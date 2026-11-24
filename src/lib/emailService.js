
import "server-only";
import { Resend } from "resend";

// Sends transactional emails through Resend.
// Used by email verification and password recovery.

export async function sendEmail({ to, subject, html, text }) {
  // Allow email delivery to be disabled through configuration.
  if (process.env.EMAIL_ENABLED !== "true") {
    return {
      success: false,
      error: "Email delivery is currently disabled.",
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  // Ensure the email service has been configured.
  if (!apiKey || !from) {
    console.error("Email service configuration is missing.");

    return {
      success: false,
      error: "Email service is not configured.",
    };
  }

  if (!to || !subject || (!html && !text)) {
    return {
      success: false,
      error: "Required email fields are missing.",
    };
  }

  try {
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      ...(html && { html }),
      ...(text && { text }),
    });

    if (error || !data?.id) {
      console.error("Resend rejected the email request.");

      return {
        success: false,
        error: "Unable to send email.",
      };
    }

    return {
      success: true,
      id: data.id,
    };
  } catch {
    console.error("Email service encountered an unexpected error.");

    return {
      success: false,
      error: "Unable to send email.",
    };
  }
}
