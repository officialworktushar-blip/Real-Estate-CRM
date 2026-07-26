export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  supabase: {
    url: process.env.SUPABASE_URL || "",
    anonKey: process.env.SUPABASE_ANON_KEY || "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
    priceStarter: process.env.STRIPE_PRICE_STARTER || "",
    priceProfessional: process.env.STRIPE_PRICE_PROFESSIONAL || "",
    priceEnterprise: process.env.STRIPE_PRICE_ENTERPRISE || "",
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  },
  email: {
    from: process.env.EMAIL_FROM || "noreply@oryntal.com",
    resendApiKey: process.env.RESEND_API_KEY || "",
  },
  frontend: {
    url: process.env.FRONTEND_URL || "http://localhost:5173",
  },
};
