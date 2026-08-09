import { supabaseAdmin } from "../config/supabase";
import { createAppError } from "../middleware/errorHandler";
import { emailService } from "./email.service";

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return slug || "org";
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

/**
 * Idempotently provisions an organization and links it to the given user's
 * profile. The DB trigger normally does this on signup; this is a safe fallback
 * for OAuth sign-ins and for users created before the trigger shipped.
 */
async function ensureOrgAndProfile(
  userId: string,
  opts: { full_name?: string; email?: string; company?: string } = {}
) {
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (fetchError) throw createAppError(fetchError.message, 500, "PROFILE_FETCH_FAILED");

  if (existing?.org_id) {
    return { org_id: existing.org_id, organization: null, profile: existing };
  }

  const orgName = opts.company || opts.full_name || existing?.full_name || "My Organization";

  const { data: org, error: orgError } = await supabaseAdmin
    .from("organizations")
    .insert({
      name: orgName,
      slug: `${slugify(orgName)}-${randomSuffix()}`,
      owner_id: userId,
    })
    .select()
    .single();

  if (orgError) throw createAppError(orgError.message, 500, "ORG_CREATE_FAILED");

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .upsert(
      {
        id: userId,
        full_name: opts.full_name || existing?.full_name || "",
        email: opts.email || existing?.email || null,
        org_id: org.id,
        role: existing?.role || "user",
      },
      { onConflict: "id" }
    )
    .select()
    .single();

  if (profileError) throw createAppError(profileError.message, 400, "PROFILE_UPDATE_FAILED");

  return { org_id: org.id, organization: org, profile };
}

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
      user_metadata: { full_name: payload.full_name, company: payload.company },
    });
    if (error) throw createAppError(error.message, 400, "REGISTRATION_FAILED");

    // The DB trigger normally provisions the org + profile; this idempotent
    // fallback guarantees every registered user is linked to an organization.
    const provisioned = await ensureOrgAndProfile(data.user.id, {
      full_name: payload.full_name,
      email: payload.email,
      company: payload.company,
    });

    // Fire-and-forget welcome email; failures are logged, never block registration.
    void emailService.sendWelcome(payload.email, payload.full_name);

    const { data: session } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: payload.email,
    });

    return { user: data.user, ...provisioned };
  },

  async ensureOrg(userId: string, fullName?: string) {
    const { data: userData } = await supabaseAdmin.auth.admin
      .getUserById(userId)
      .catch(() => ({ data: { user: null } }));
    const user = userData?.user;

    return ensureOrgAndProfile(userId, {
      full_name: fullName || user?.user_metadata?.full_name,
      email: user?.email,
    });
  },

  async forgotPassword(email: string) {
    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.CORS_ORIGIN}/auth/reset-password`,
    });
    if (error) throw createAppError(error.message, 400, "RESET_FAILED");
  },
};
