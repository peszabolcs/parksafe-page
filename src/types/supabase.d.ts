// Supabase client type definitions
export interface SupabaseClient {
  auth: {
    getSession(): Promise<{ data: { session: any } }>;
    onAuthStateChange(callback: (event: any, session: any) => void): { data: { subscription: { unsubscribe(): void } } };
    signInWithPassword(credentials: { email: string; password: string }): Promise<{ data: any; error: any }>;
    signInWithOAuth(options: { provider: string; options?: any }): Promise<{ data: any; error: any }>;
    signOut(): Promise<{ error: any }>;
  };
  storage: any;
  from(table: string): any;
}

declare module '../lib/supabaseClient' {
  export const supabase: SupabaseClient;
}