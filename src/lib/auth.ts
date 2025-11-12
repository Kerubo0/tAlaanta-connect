/**
 * Authentication and User Management
 * Firebase Auth + Firestore for user profiles
 */

import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  Firestore 
} from 'firebase/firestore';
import { auth, db } from './firebase';

export type UserRole = 'freelancer' | 'client';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  walletAddress?: string;
  createdAt: number;
  updatedAt: number;
  
  // Freelancer-specific fields
  bio?: string;
  skills?: string[];
  hourlyRate?: number;
  portfolio?: string;
  availability?: 'available' | 'busy' | 'unavailable';
  
  // Client-specific fields
  companyName?: string;
  companyWebsite?: string;
  industry?: string;
  
  // Common fields
  profileImage?: string;
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
  if (!auth || !db) throw new Error('Firebase not initialized');

  // Create Firebase Auth user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update display name
  await updateProfile(user, { displayName });

  // Create user profile in Firestore
  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email!,
    role,
    displayName,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    verified: false,
    ...additionalData,
  };

  await setDoc(doc(db as Firestore, 'users', user.uid), userProfile);

  return userProfile;
}

/**
 * Sign in existing user
 */
export async function signIn(email: string, password: string): Promise<UserProfile> {
  if (!auth || !db) throw new Error('Firebase not initialized');

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Get user profile from Firestore
  const userDoc = await getDoc(doc(db as Firestore, 'users', user.uid));
  
  if (!userDoc.exists()) {
    throw new Error('User profile not found');
  }

  return userDoc.data() as UserProfile;
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  if (!auth) throw new Error('Firebase not initialized');
  await firebaseSignOut(auth);
}

/**
 * Get current user profile
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  if (!auth || !db) return null;

  const user = auth.currentUser;
  if (!user) return null;

  const userDoc = await getDoc(doc(db as Firestore, 'users', user.uid));
  
  if (!userDoc.exists()) return null;

  return userDoc.data() as UserProfile;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');

  const userRef = doc(db as Firestore, 'users', uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: Date.now(),
  });
}

/**
 * Link wallet address to user profile
 */
export async function linkWalletToProfile(
  uid: string,
  walletAddress: string
): Promise<void> {
  await updateUserProfile(uid, { walletAddress });
}

/**
 * Listen to auth state changes
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  if (!auth) throw new Error('Firebase not initialized');
  return onAuthStateChanged(auth, callback);
}

/**
 * Get user profile by UID
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) throw new Error('Firebase not initialized');

  const userDoc = await getDoc(doc(db as Firestore, 'users', uid));
  
  if (!userDoc.exists()) return null;

  return userDoc.data() as UserProfile;
}
