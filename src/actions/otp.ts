import { prisma } from "@/lib/prisma";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import nodemailer from "nodemailer";

// Create transporter
const createTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    throw new Error("Gmail credentials not configured");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
};

// Email template for OTP
function getEmailTemplate(otpCode: string) {
  return {
    subject: "Your Cazzert Verification Code",
    html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Your Verification Code - Cazzert</title>
                <style>
                  body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    margin: 0; 
                    padding: 20px; 
                    background-color: #f5f5f5; 
                  }
                  .container { 
                    max-width: 600px; 
                    margin: 0 auto; 
                    background: white; 
                    border-radius: 12px; 
                    overflow: hidden; 
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
                  }
                  .header { 
                    background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%); 
                    color: white; 
                    padding: 40px 30px; 
                    text-align: center; 
                  }
                  .header h1 { 
                    margin: 0; 
                    font-size: 32px; 
                    font-weight: 700; 
                    letter-spacing: -0.5px;
                  }
                  .header p { 
                    margin: 8px 0 0 0; 
                    opacity: 0.9; 
                    font-size: 16px;
                  }
                  .content { 
                    padding: 40px 30px; 
                  }
                  .otp-container {
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                    border: 3px solid #8B5CF6;
                    border-radius: 16px;
                    padding: 30px;
                    text-align: center;
                    margin: 30px 0;
                    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
                  }
                  .otp-code {
                    font-size: 48px;
                    font-weight: 800;
                    color: #8B5CF6;
                    letter-spacing: 8px;
                    font-family: 'Courier New', monospace;
                    margin: 0;
                    text-shadow: 0 2px 4px rgba(139, 92, 246, 0.2);
                  }
                  .warning-box {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 8px;
                    padding: 16px;
                    margin: 25px 0;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                  }
                  .warning-text {
                    color: #856404;
                    font-weight: 500;
                    margin: 0;
                  }
                  .footer { 
                    background: #f8fafc; 
                    padding: 30px; 
                    text-align: center; 
                    border-top: 1px solid #e2e8f0; 
                  }
                  .footer p {
                    color: #64748b; 
                    font-size: 14px; 
                    margin: 5px 0;
                  }
                  .brand-footer {
                    color: #8B5CF6;
                    font-weight: 600;
                    font-size: 16px;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>🍰 Cazzert</h1>
                    <p>Your Premium Cake Destination</p>
                  </div>
                  <div class="content">
                    <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 28px;">Your Verification Code</h2>
                    <p style="color: #475569; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">
                      Use this verification code to access your account:
                    </p>
                    
                    <div class="otp-container">
                      <p class="otp-code">${otpCode}</p>
                    </div>

                    <div class="warning-box">
                      <span style="font-size: 20px;">⏰</span>
                      <p class="warning-text">
                        This code will expire in <strong>5 minutes</strong> for your security.
                      </p>
                    </div>

                    <p style="color: #64748b; font-size: 14px; margin: 25px 0 0 0; line-height: 1.5;">
                      If you didn't request this verification code, please ignore this email.
                    </p>
                  </div>
                  <div class="footer">
                    <p class="brand-footer">Cazzert - Where Every Cake Tells a Story</p>
                    <p>This is an automated message. Please do not reply to this email.</p>
                    <p>Need help? Contact us at support@cazzert.com</p>
                  </div>
                </div>
              </body>
            </html>
          `,
    text: `
Your Cazzert Verification Code

Use this verification code to access your account: ${otpCode}

⏰ This code will expire in 5 minutes for your security.

If you didn't request this code, please ignore this email.

---
Cazzert - Your Premium Cake Destination
This is an automated message. Please do not reply to this email.
Need help? Contact us at support@cazzert.com
          `,
  };
}

export const otp = {
  sendOTP: defineAction({
    input: z.object({
      email: z.string().email(),
    }),
    handler: async ({ email }) => {
      const trimmedEmail = email.trim().toLowerCase();

      try {
        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Create and verify transporter
        const transporter = createTransporter();
        await transporter.verify();

        // Email template
        const emailTemplate = getEmailTemplate(otpCode);

        // Send email
        const mailOptions = {
          from: `"Cazzert" <${process.env.GMAIL_USER}>`,
          to: trimmedEmail,
          subject: emailTemplate.subject,
          text: emailTemplate.text,
          html: emailTemplate.html,
        };

        await transporter.sendMail(mailOptions);

        // Save OTP to database
        await prisma.otp.create({
          data: {
            otp: otpCode,
            email: trimmedEmail,
          },
        });

        console.log(`OTP sent and saved for ${trimmedEmail}: ${otpCode}`);

        return {
          success: true,
          message: "Verification code sent successfully",
        };
      } catch (error: any) {
        console.error("Error in sendOTP action:", error);

        return {
          success: false,
          message: "Failed to send verification code. Please try again.",
        };
      }
    },
  }),

  verifyOTP: defineAction({
    input: z.object({
      email: z.string().email(),
      otp: z.string().length(6),
    }),
    handler: async ({ email, otp }) => {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedOtp = otp.trim();

      try {
        // Find OTP in database
        const otpRecord = await prisma.otp.findFirst({
          where: {
            email: trimmedEmail,
            otp: trimmedOtp,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        if (!otpRecord) {
          return {
            success: false,
            message: "Invalid verification code",
          };
        }

        // Check if OTP is expired (5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (otpRecord.createdAt < fiveMinutesAgo) {
          // Delete expired OTP
          await prisma.otp.delete({
            where: { id: otpRecord.id },
          });

          return {
            success: false,
            message: "Verification code has expired. Please request a new one.",
          };
        }

        // OTP is valid, delete it from database
        await prisma.otp.delete({
          where: { id: otpRecord.id },
        });

        console.log(`OTP verified and deleted for ${trimmedEmail}`);

        return {
          success: true,
          message: "Verification successful",
        };
      } catch (error: any) {
        console.error("Error in verifyOTP action:", error);

        return {
          success: false,
          message: "Failed to verify code. Please try again.",
        };
      }
    },
  }),
};
