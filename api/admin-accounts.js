import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const usernamePattern = /^[A-Za-z0-9._-]{3,32}$/;

function sendJson(response, status, payload) {
  response.status(status).json(payload);
}

function getBearerToken(request) {
  const header = request.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  return scheme?.toLowerCase() === "bearer" ? token : "";
}

function normalizeAccountPayload(body = {}) {
  return {
    id: typeof body.id === "string" ? body.id.trim() : "",
    username: typeof body.username === "string" ? body.username.trim() : "",
    email: typeof body.email === "string" ? body.email.trim() : "",
    password: typeof body.password === "string" ? body.password : "",
  };
}

async function verifyAdmin(request, authClient, adminClient) {
  const token = getBearerToken(request);
  if (!token) {
    return { error: "Sesi admin tidak ditemukan.", status: 401 };
  }

  const { data: userData, error: userError } = await authClient.auth.getUser(token);
  const user = userData?.user;

  if (userError || !user) {
    return { error: "Sesi admin tidak valid.", status: 401 };
  }

  const { data: profile, error: profileError } = await adminClient
    .from("admin_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { error: "Akun ini tidak punya akses admin.", status: 403 };
  }

  return { user };
}

async function listAccounts(adminClient) {
  const { data: profiles, error: profileError } = await adminClient
    .from("admin_profiles")
    .select("id, username, created_at")
    .order("created_at", { ascending: true });

  if (profileError) throw profileError;

  const authUsers = [];
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const users = data?.users || [];
    authUsers.push(...users);
    if (users.length < perPage) break;
    page += 1;
  }

  const usersById = new Map(authUsers.map((user) => [user.id, user]));

  return (profiles || []).map((profile) => {
    const user = usersById.get(profile.id);

    return {
      id: profile.id,
      username: profile.username,
      email: user?.email || "",
      created_at: profile.created_at,
      last_sign_in_at: user?.last_sign_in_at || null,
    };
  });
}

function validateRequiredAccount(payload) {
  if (!usernamePattern.test(payload.username)) {
    return "Username harus 3-32 karakter dan hanya boleh huruf, angka, titik, garis bawah, atau tanda minus.";
  }

  if (!payload.email) {
    return "Email wajib diisi.";
  }

  return "";
}

export default async function handler(request, response) {
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return sendJson(response, 500, {
      error: "Env Supabase server belum lengkap. Isi SUPABASE_SERVICE_ROLE_KEY dan SUPABASE_URL/VITE_SUPABASE_URL.",
    });
  }

  const authClient = createClient(supabaseUrl, anonKey);
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const verified = await verifyAdmin(request, authClient, adminClient);
  if (verified.error) {
    return sendJson(response, verified.status, { error: verified.error });
  }

  try {
    if (request.method === "GET") {
      const accounts = await listAccounts(adminClient);
      return sendJson(response, 200, { accounts });
    }

    if (request.method === "POST") {
      const payload = normalizeAccountPayload(request.body);
      const validationMessage = validateRequiredAccount(payload);

      if (validationMessage) {
        return sendJson(response, 400, { error: validationMessage });
      }

      if (payload.password.length < 6) {
        return sendJson(response, 400, { error: "Password minimal 6 karakter." });
      }

      const { data, error: createError } = await adminClient.auth.admin.createUser({
        email: payload.email,
        password: payload.password,
        email_confirm: true,
      });

      if (createError) throw createError;

      const { error: profileError } = await adminClient.from("admin_profiles").insert({
        id: data.user.id,
        username: payload.username,
      });

      if (profileError) {
        await adminClient.auth.admin.deleteUser(data.user.id);
        throw profileError;
      }

      const accounts = await listAccounts(adminClient);
      return sendJson(response, 201, { accounts, message: "Akun admin berhasil ditambahkan." });
    }

    if (request.method === "PATCH") {
      const payload = normalizeAccountPayload(request.body);
      const validationMessage = validateRequiredAccount(payload);

      if (!payload.id) {
        return sendJson(response, 400, { error: "ID akun tidak ditemukan." });
      }

      if (validationMessage) {
        return sendJson(response, 400, { error: validationMessage });
      }

      if (payload.password && payload.password.length < 6) {
        return sendJson(response, 400, { error: "Password minimal 6 karakter." });
      }

      const authPayload = { email: payload.email };
      if (payload.password) authPayload.password = payload.password;

      const { error: authError } = await adminClient.auth.admin.updateUserById(payload.id, authPayload);
      if (authError) throw authError;

      const { error: profileError } = await adminClient
        .from("admin_profiles")
        .update({ username: payload.username })
        .eq("id", payload.id);

      if (profileError) throw profileError;

      const accounts = await listAccounts(adminClient);
      return sendJson(response, 200, { accounts, message: "Akun admin berhasil diperbarui." });
    }

    if (request.method === "DELETE") {
      const payload = normalizeAccountPayload(request.body);

      if (!payload.id) {
        return sendJson(response, 400, { error: "ID akun tidak ditemukan." });
      }

      if (payload.id === verified.user.id) {
        return sendJson(response, 400, { error: "Akun yang sedang dipakai tidak bisa dihapus dari halaman ini." });
      }

      const { error } = await adminClient.auth.admin.deleteUser(payload.id);
      if (error) throw error;

      const accounts = await listAccounts(adminClient);
      return sendJson(response, 200, { accounts, message: "Akun admin berhasil dihapus." });
    }

    response.setHeader("Allow", "GET, POST, PATCH, DELETE");
    return sendJson(response, 405, { error: "Metode tidak didukung." });
  } catch (error) {
    return sendJson(response, 500, { error: error.message || "Permintaan akun admin gagal." });
  }
}
