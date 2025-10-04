export const cookieConfig = {
  // Environment-based flags
  secure: import.meta.env.COOKIE_SECURE === "true",
  sameSite: import.meta.env.COOKIE_SAME_SITE === "true",
  httpOnly: import.meta.env.COOKIE_HTTP_ONLY === "true",

  // Age settings (in seconds)
  accessTokenAge: 24 * 60 * 60, // 1 day
  refreshTokenAge: 30 * 24 * 60 * 60, // 30 days
  csrfTokenAge: 7 * 24 * 60 * 60, // 7 days

  // Astro-compatible cookie options
  getAccessTokenOptions: () => ({
    path: "/",
    httpOnly: cookieConfig.httpOnly,
    secure: cookieConfig.secure,
    sameSite: cookieConfig.sameSite,
    maxAge: cookieConfig.accessTokenAge,
  }),

  getRefreshTokenOptions: () => ({
    path: "/",
    httpOnly: cookieConfig.httpOnly,
    secure: cookieConfig.secure,
    sameSite: cookieConfig.sameSite,
    maxAge: cookieConfig.refreshTokenAge,
  }),

  getCsrfTokenOptions: () => ({
    path: "/",
    secure: cookieConfig.secure,
    sameSite: cookieConfig.sameSite,
    maxAge: cookieConfig.csrfTokenAge,
  }),

  // Clear cookie options
  getClearedAccessTokenOptions: () => ({
    path: "/",
    httpOnly: cookieConfig.httpOnly,
    secure: cookieConfig.secure,
    sameSite: cookieConfig.sameSite,
    maxAge: 0,
  }),

  getClearedRefreshTokenOptions: () => ({
    path: "/",
    httpOnly: cookieConfig.httpOnly,
    secure: cookieConfig.secure,
    sameSite: cookieConfig.sameSite,
    maxAge: 0,
  }),

  getClearedCsrfTokenOptions: () => ({
    path: "/",
    secure: cookieConfig.secure,
    sameSite: cookieConfig.sameSite,
    maxAge: 0,
  }),
};
