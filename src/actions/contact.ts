import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import nodemailer from "nodemailer";

// Validation schema for contact form
const ContactFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  subject: z
    .string()
    .min(1, { message: "Subject is required" })
    .max(200, { message: "Subject must be less than 200 characters" }),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(2000, { message: "Message must be less than 2000 characters" }),
  type: z.enum(
    [
      "general",
      "custom-order",
      "wedding",
      "bulk-order",
      "catering",
      "complaint",
    ],
    {
      message: "Please select a valid inquiry type",
    },
  ),
});

function getErrorMessage(result: any) {
  // Grab all issues and fieldErrors
  const { issues } = result.error;
  const fields = result.error.flatten().fieldErrors;

  // First error message for top-level message
  const firstMsg = issues[0]?.message ?? "Invalid input";

  return {
    data: {
      success: false,
      message: firstMsg,
    },
    error: {
      type: "AstroActionInputError",
      issues,
      fields,
    },
  };
}

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
};

// Email templates
const getEmailTemplate = (data: any) => {
  const typeLabels = {
    general: "General Inquiry",
    "custom-order": "Custom Cake Order",
    wedding: "Wedding Cake Inquiry",
    "bulk-order": "Bulk Order Request",
    catering: "Catering Services",
    complaint: "Complaint/Feedback",
  };

  return {
    subject: `[Cazzert Contact] ${typeLabels[data.type as keyof typeof typeLabels]} - ${data.subject}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission</title>
          <style>
            body { font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #4a4a4a; margin: 0; padding: 20px; background-color: #fff8f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #d18ea4 0%, #b7788f 100%); color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; font-family: 'Playfair Display', serif; }
            .header p { margin: 10px 0 0 0; opacity: 0.9; }
            .content { padding: 30px 20px; }
            .field { margin-bottom: 20px; }
            .field-label { font-weight: 600; color: #4a4a4a; margin-bottom: 5px; display: block; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; }
            .field-value { background: #f9fafb; border: 1px solid #e5a9bd; border-radius: 8px; padding: 12px; font-size: 14px; }
            .message-field .field-value { min-height: 100px; white-space: pre-wrap; }
            .type-badge { display: inline-block; padding: 6px 16px; background: #fce3eb; color: #b7788f; border-radius: 20px; font-size: 12px; font-weight: 500; }
            .footer { background: #f0e5e9; padding: 20px; text-align: center; border-top: 1px solid #e5a9bd; color: #6b5a5f; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🧁 New Contact Form Submission</h1>
              <p>Cazzert - Handcrafted with Love</p>
            </div>
            <div class="content">
              <div class="field">
                <span class="field-label">Inquiry Type</span>
                <div class="field-value">
                  <span class="type-badge">${typeLabels[data.type as keyof typeof typeLabels]}</span>
                </div>
              </div>
              <div class="field">
                <span class="field-label">From</span>
                <div class="field-value">${data.name} &lt;${data.email}&gt;</div>
              </div>
              <div class="field">
                <span class="field-label">Subject</span>
                <div class="field-value">${data.subject}</div>
              </div>
              <div class="field message-field">
                <span class="field-label">Message</span>
                <div class="field-value">${data.message}</div>
              </div>
            </div>
            <div class="footer">
              <p>This message was sent via the Cazzert website contact form.</p>
              <p>Received on ${new Date().toLocaleString("en-BD", {
                timeZone: "Asia/Dhaka",
                dateStyle: "full",
                timeStyle: "short",
              })} (Dhaka Time)</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
New Contact Form Submission - Cazzert

Inquiry Type: ${typeLabels[data.type as keyof typeof typeLabels]}
From: ${data.name} <${data.email}>
Subject: ${data.subject}

Message:
${data.message}

---
This message was sent via the Cazzert website contact form.
Received on ${new Date().toLocaleString("en-BD", {
      timeZone: "Asia/Dhaka",
      dateStyle: "full",
      timeStyle: "short",
    })} (Dhaka Time)
    `,
  };
};

const getAutoReplyTemplate = (data: any) => {
  const typeResponses = {
    general:
      "We've received your general inquiry and will respond within 24 hours.",
    "custom-order":
      "Thank you for your custom cake order inquiry! Our bakers will contact you within 4-6 hours to discuss your requirements and provide a quote.",
    wedding:
      "We're excited to help make your special day even sweeter! Our wedding cake specialist will reach out within 24 hours to discuss your vision.",
    "bulk-order":
      "Thank you for your bulk order inquiry! We'll review your requirements and get back to you within 12 hours with availability and pricing.",
    catering:
      "Thank you for considering Cazzert for your catering needs! Our catering team will contact you within 24 hours.",
    complaint:
      "We take your feedback seriously and apologize for any inconvenience. Our customer service team will address your concern within 12 hours.",
  };

  return {
    subject:
      "Thank you for contacting Cazzert - We've received your sweet message! 🧁",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thank you for contacting Cazzert</title>
          <style>
            body { font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #4a4a4a; margin: 0; padding: 20px; background-color: #fff8f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #d18ea4 0%, #b7788f 100%); color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; font-family: 'Playfair Display', serif; }
            .header p { margin: 10px 0 0 0; opacity: 0.9; }
            .content { padding: 30px 20px; }
            .message { background: #fce3eb; border-left: 4px solid #d18ea4; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .footer { background: #f0e5e9; padding: 20px; text-align: center; border-top: 1px solid #e5a9bd; color: #6b5a5f; font-size: 12px; }
            .cta-button { display: inline-block; background: #d18ea4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; margin: 10px 5px; }
            .cta-button:hover { background: #b7788f; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🧁 Thank You!</h1>
              <p>Cazzert - Handcrafted with Love Since 2021</p>
            </div>
            <div class="content">
              <p>Dear ${data.name},</p>
              <p>Thank you for reaching out to Cazzert! We're delighted to hear from you and appreciate your interest in our handcrafted cakes and pastries.</p>
              
              <div class="message">
                <strong>What happens next?</strong><br>
                ${typeResponses[data.type as keyof typeof typeResponses]}
              </div>

              <p><strong>Your message summary:</strong></p>
              <ul>
                <li><strong>Subject:</strong> ${data.subject}</li>
                <li><strong>Inquiry Type:</strong> ${data.type.charAt(0).toUpperCase() + data.type.slice(1).replace("-", " ")}</li>
                <li><strong>Submitted:</strong> ${new Date().toLocaleString(
                  "en-BD",
                  {
                    timeZone: "Asia/Dhaka",
                    dateStyle: "full",
                    timeStyle: "short",
                  },
                )} (Dhaka Time)</li>
              </ul>

              <p>In the meantime, feel free to:</p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="https://cazzert.com/products" class="cta-button">Browse Our Cakes</a>
                <a href="https://cazzert.com/about" class="cta-button">Learn Our Story</a>
              </div>

              <p>Sweet regards,<br>
              <strong>The Cazzert Team</strong><br>
              <em>Baking dreams into reality</em> ✨</p>
            </div>
            <div class="footer">
              <p><strong>Cazzert</strong> - Handcrafted Cakes & Pastries</p>
              <p>📧 Email: hello@cazzert.com | 📞 Phone: +880 1234567890</p>
              <p>📍 123 Sweet Street, Dhaka, Bangladesh</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Dear ${data.name},

Thank you for reaching out to Cazzert! We're delighted to hear from you and appreciate your interest in our handcrafted cakes and pastries.

What happens next?
${typeResponses[data.type as keyof typeof typeResponses]}

Your message summary:
- Subject: ${data.subject}
- Inquiry Type: ${data.type.charAt(0).toUpperCase() + data.type.slice(1).replace("-", " ")}
- Submitted: ${new Date().toLocaleString("en-BD", {
      timeZone: "Asia/Dhaka",
      dateStyle: "full",
      timeStyle: "short",
    })} (Dhaka Time)

In the meantime, feel free to:
- Browse our cakes: https://cazzert.com/products
- Learn our story: https://cazzert.com/about

Sweet regards,
The Cazzert Team
Baking dreams into reality ✨

---
Cazzert - Handcrafted Cakes & Pastries
Email: hello@cazzert.com | Phone: +880 1234567890
123 Sweet Street, Dhaka, Bangladesh

This is an automated message. Please do not reply to this email.
    `,
  };
};

export const contact = {
  // Submit contact form
  submit: defineAction({
    accept: "form",
    async handler(formData, _ctx) {
      // Convert FormData to object
      const raw = Object.fromEntries(formData.entries());

      // Parse and validate input
      const result = ContactFormSchema.safeParse(raw);
      if (!result.success) {
        return getErrorMessage(result);
      }

      const { name, email, subject, message, type } = result.data;

      try {
        if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
          console.error("SMTP configuration missing");
          return {
            data: {
              success: false,
              message:
                "Email service is not configured. Please try again later.",
            },
            error: null,
          };
        }

        // Create transporter
        const transporter = createTransporter();

        // Verify SMTP connection
        try {
          await transporter.verify();
        } catch (error) {
          console.error("SMTP connection failed:", error);
          return {
            data: {
              success: false,
              message:
                "Email service is temporarily unavailable. Please try again later.",
            },
            error: null,
          };
        }

        // Prepare emails
        const adminEmail = getEmailTemplate({
          name,
          email,
          subject,
          message,
          type,
        });
        const autoReply = getAutoReplyTemplate({
          name,
          email,
          subject,
          message,
          type,
        });

        // Send email to admin
        const adminMailOptions = {
          from: `"Cazzert Contact Form" <${process.env.GMAIL_USER}>`,
          to: process.env.CONTACT_EMAIL || process.env.GMAIL_USER,
          replyTo: email,
          subject: adminEmail.subject,
          text: adminEmail.text,
          html: adminEmail.html,
        };

        // Send auto-reply to user
        const autoReplyOptions = {
          from: `"Cazzert - Handcrafted with Love" <${process.env.GMAIL_USER}>`,
          to: email,
          subject: autoReply.subject,
          text: autoReply.text,
          html: autoReply.html,
        };

        // Send both emails
        await Promise.all([
          transporter.sendMail(adminMailOptions),
          transporter.sendMail(autoReplyOptions),
        ]);

        return {
          data: {
            success: true,
            message:
              "Thank you for your sweet message! We've sent you a confirmation email and will get back to you soon. 🧁",
          },
          error: null,
        };
      } catch (error) {
        console.error("Error sending contact form:", error);
        return {
          data: {
            success: false,
            message: "Failed to send message. Please try again later.",
          },
          error: null,
        };
      }
    },
  }),
};
