import supabase from './supabase';

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
      queryParams: {
        prompt: 'select_account',
      },
    },
  });
  if (error) {
    console.error('[google-auth] signInWithOAuth failed:', error.message);
  }
}
