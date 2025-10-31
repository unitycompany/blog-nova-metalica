function readEnvVar(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return '';
}

export const env = {
  supabase: {
    url: readEnvVar('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL'),
    anonKey: readEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY'),
  },
};
