/**
 * Authentication and User Management
 * Supabase Auth + PostgreSQL for user profiles
 */

import { supabase } from './supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'freelancer' | 'client';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  display_name: string;
  wallet_address?: string;
  created_at: string;
  updated_at: string;
  
  // Freelancer-specific fields
  bio?: string;
  skills?: string[];
  hourly_rate?: number;
  portfolio?: string;
  availability?: 'available' | 'busy' | 'unavailable';
  
  // Client-specific fields
  company_name?: string;
  company_website?: string;
  industry?: string;
  
  // Common fields
  profile_image?: string;
  location?: string;
  timezone?: string;
  verified?: boolean;
}

/**
 * Create a new user account
 */
export async function signUp(
  email: string,
  password: string,
  displayName: string,
  role: UserRole,
  additionalData?: Partial<UserProfile>
): Promise<UserProfile> {
  if (!supabase) throw new Error('Supabase not initialized');

  // Create Supabase Auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        role,
      },
    },
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('Failed to create user');

  // Create user profile in database
  const userProfile: Omit<UserProfile, 'uid'> = {
    email: authData.user.email!,
    role,
    display_name: displayName,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    verified: false,
    ...additionalData,
  };

  const { data, error } = await supabase
    .from('users')
    .insert([{ ...userProfile, uid: authData.user.id }])
    .select()
    .single();

  if (error) throw error;

  return data as UserProfile;
}

/**
 * Sign in existing user
 */
export async function signIn(email: string, password: string): Promise<UserProfile> {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('Failed to sign in');

  // Get user profile from database
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('uid', authData.user.id)
    .single();

  if (error) throw error;
  if (!data) throw new Error('User profile not found');

  return data as UserProfile;
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  if (!supabase) throw new Error('Supabase not initialized');
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get current user profile
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('uid', user.id)
    .single();

  if (error) return null;
  return data as UserProfile;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  if (!supabase) throw new Error('Supabase not initialized');

  const { error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('uid', uid);

  if (error) throw error;
}

/**
 * Link wallet address to user profile
 */
export async function linkWalletToProfile(
  uid: string,
  walletAddress: string
): Promise<void> {
  await updateUserProfile(uid, { wallet_address: walletAddress });
}

/**
 * Listen to auth state changes
 */
export function onAuthChange(callback: (user: SupabaseUser | null) => void) {
  if (!supabase) throw new Error('Supabase not initialized');
  
  // Get initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    callback(session?.user ?? null);
  });

  // Listen for changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return subscription;
}

/**
 * Get user profile by UID
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('uid', uid)
    .single();

  if (error) return null;
  return data as UserProfile;
}
