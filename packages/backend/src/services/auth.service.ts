import { supabaseAdmin } from "../config/supabase";
import { createAppError } from "../middleware/errorHandler";

export const authService = {
  async login(email: string, password: string) {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
    if (error) throw createAppError(error.message, 401, "INVALID_CREDENTIALS");

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .maybeSingle();

    return {
      user: data.user,
      session: data.session,
      profile,
    };
  },

  async register(payload: { email: string; password: string; full_name: string; company?: string }) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      email_confirm: true,
      user_metadata: { full_name: payload.full_name },
    });
    if (error) throw createAppError(error.message, 400, "REGISTRATION_FAILED");

    await supabaseAdmin.from("profiles").insert({
      id: data.user.id,
      email: payload.email,
      full_name: payload.full_name,
      role: "user",
    });

    const { data: session } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: payload.email,
    });

    return { user: data.user };
  },

  async forgotPassword(email: string) {
    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.CORS_ORIGIN}/auth/reset-password`,
    });
    if (error) throw createAppError(error.message, 400, "RESET_FAILED");
  },
};
