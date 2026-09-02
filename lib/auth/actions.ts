'use server';

/**
 * Auth server actions. Always validate with Zod before touching Supabase —
 * never trust client input directly.
 */

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { signInSchema, signUpSchema } from '@/lib/validation/schemas';

export interface AuthActionResult {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function signUpAction(formData: FormData): Promise<void> {
  const raw = {
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
    fullName: String(formData.get('fullName') ?? ''),
    role: String(formData.get('role') ?? 'shipper'),
    phone: formData.get('phone') ? String(formData.get('phone')) : undefined,
    companyName: formData.get('companyName') ? String(formData.get('companyName')) : undefined,
  };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    redirect('/signup?error=' + encodeURIComponent('Invalid input. Please check every field.'));
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        role: parsed.data.role,
        phone: parsed.data.phone ?? null,
        company_name: parsed.data.companyName ?? null,
      },
    },
  });

  if (error) {
    redirect('/signup?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signInAction(formData: FormData): Promise<void> {
  const raw = {
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
  };

  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    redirect('/login?error=' + encodeURIComponent('Invalid input.'));
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    // Safe, generic error message — never leak whether the email exists.
    redirect('/login?error=' + encodeURIComponent('Invalid email or password.'));
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signOutAction(): Promise<void> {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}
