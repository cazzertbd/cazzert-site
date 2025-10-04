import { cookieConfig } from "@/configs";
import { auth, csrf, prisma } from "@/lib";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import bcrypt from "bcrypt";

const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(8, { message: "Password must be 8+ characters" }),
});

const SignupSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be least 3 characters" })
    .refine((value) => /^(?!\s+$)(\S+\s?)*\S+$/.test(value), {
      message: "Name cannot contain only spaces or multiple consecutive spaces",
    }),
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
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

async function setCookies(
  ctx: any,
  user?: any,
  at?: string,
  rt?: string,
  skipCsrf = false,
) {
  // Create tokens
  const refreshToken = rt || (await auth.createRefreshToken(user.id));
  const csrfToken = csrf.generateToken();
  const accessToken = at || auth.createAccessToken(user);

  // Set cookies
  ctx.cookies.set(
    "access-token",
    accessToken,
    cookieConfig.getAccessTokenOptions(),
  );
  ctx.cookies.set(
    "refresh-token",
    refreshToken,
    cookieConfig.getRefreshTokenOptions(),
  );
  ctx.cookies.set("isLoggedIn", "true", {
    // Copy access token options but make it accessible to JavaScript
    ...cookieConfig.getAccessTokenOptions(),
    httpOnly: false,
  });
  // Set isAdmin cookie based on user role
  ctx.cookies.set("isAdmin", user?.role === "ADMIN" ? "true" : "false", {
    // Copy access token options but make it accessible to JavaScript
    ...cookieConfig.getAccessTokenOptions(),
    httpOnly: false,
  });
  if (!skipCsrf) {
    ctx.cookies.set(
      "csrf-token",
      csrfToken,
      cookieConfig.getCsrfTokenOptions(),
    );
  }
}

async function refreshCookies(ctx: any, newTokens: any) {
  setCookies(
    ctx,
    undefined,
    newTokens?.accessToken,
    newTokens?.refreshToken,
    true,
  );
}

export const authActions = {
  login: defineAction({
    accept: "form",
    async handler(formData, ctx) {
      const raw = Object.fromEntries(formData.entries());

      const result = LoginSchema.safeParse(raw);
      if (!result.success) {
        // Handle validation errors
        return getErrorMessage(result);
      }

      // 5. Destructure validated data
      const { email, password } = result.data;

      try {
        // Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          return {
            data: { success: false, message: "Invalid credentials" },
            error: null,
          };
        }

        // Verify password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return {
            data: { success: false, message: "Invalid credentials" },
            error: null,
          };
        }

        // Create tokens && set cookies
        await setCookies(ctx, user);

        // Success response
        return {
          data: {
            success: true,
            message: "Authentication successful",
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
          },
          error: null,
        };
      } catch (err) {
        console.error("Login error:", err);
        return {
          data: { success: false, message: "An error occurred during login" },
          error: null,
        };
      }
    },
  }),

  // Add signup action
  signup: defineAction({
    accept: "form",
    async handler(formData, ctx) {
      const raw = Object.fromEntries(formData.entries());

      const result = SignupSchema.safeParse(raw);
      if (!result.success) {
        return getErrorMessage(result);
      }

      // Extract validated data
      const { name, email, password } = result.data;

      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          return {
            data: {
              success: false,
              message: "Email already in use",
            },
            error: null,
          };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role: "USER", // Default role
          },
        });

        // Create tokens && set cookies
        await setCookies(ctx, user);

        // Success response
        return {
          data: {
            success: true,
            message: "Registration successful",
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
          },
          error: null,
        };
      } catch (err) {
        console.error("Registration error:", err);
        return {
          data: {
            success: false,
            message: "An error occurred during registration",
          },
          error: null,
        };
      }
    },
  }),

  // Add refresh token action
  refresh: defineAction({
    accept: "form",
    async handler(_, ctx) {
      try {
        // Get refresh token from cookies
        const refreshToken = ctx.cookies.get("refresh-token")?.value;

        if (!refreshToken) {
          return {
            data: {
              success: false,
              message: "No refresh token",
            },
            error: null,
          };
        }

        // Hash token to find in database
        const newTokens = await auth.refreshAccessToken(refreshToken);

        // Create new tokens and set cookies
        await refreshCookies(ctx, newTokens);

        return {
          data: {
            success: true,
            message: "Token refreshed",
          },
          error: null,
        };
      } catch (error) {
        console.error("Refresh token error:", error);
        return {
          data: {
            success: false,
            message: "Error processing refresh token",
          },
          error: null,
        };
      }
    },
  }),

  // Add logout action
  logout: defineAction({
    async handler(_, ctx) {
      try {
        // Extract refresh token from cookies
        const refreshToken = ctx.cookies.get("refresh-token")?.value;

        if (refreshToken) {
          // Delete the token from database
          await prisma.refreshToken.deleteMany({
            where: { token: auth.hashToken(refreshToken) },
          });
        }

        // Clear cookies
        ctx.cookies.delete(
          "access-token",
          cookieConfig.getAccessTokenOptions(),
        );
        ctx.cookies.delete(
          "refresh-token",
          cookieConfig.getRefreshTokenOptions(),
        );
        ctx.cookies.delete("csrf-token", cookieConfig.getCsrfTokenOptions());
        ctx.cookies.delete("isLoggedIn", {
          ...cookieConfig.getAccessTokenOptions(),
          httpOnly: false,
        });
        ctx.cookies.delete("isAdmin", {
          ...cookieConfig.getAccessTokenOptions(),
          httpOnly: false,
        });

        return {
          data: {
            success: true,
            message: "Logged out successfully",
          },
          error: null,
        };
      } catch (error) {
        console.error("Logout error:", error);
        return {
          data: {
            success: false,
            message: "An error occurred during logout",
          },
          error: null,
        };
      }
    },
  }),
};
