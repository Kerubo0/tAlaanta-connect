/**
 * Aqua Protocol Reputation System
 * Implements verifiable, cryptographically-signed reviews that cannot be faked
 * Based on: https://aqua-protocol.org/docs/v3/schema_2
 */

import { ethers } from 'ethers';
import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, orderBy, Firestore } from 'firebase/firestore';

// Aqua Protocol Schema Version
const AQUA_VERSION = "https://aqua-protocol.org/docs/v3/schema_2 | SHA256 | Method: scalar";
const SIGNATURE_TYPE = "ethereum:eip-191";

/**
 * Aqua Revision Types
 */
export type RevisionType = 'form' | 'signature' | 'witness' | 'file';

/**
 * Form Revision - Contains the review data
 */
export interface FormRevision {
  previous_verification_hash: string;
  local_timestamp: string; // YYYYMMDDHHMMSS format
  revision_type: 'form';
  file_hash: string;
  file_nonce: string;
  // Review-specific form fields
  forms_reviewer_address: string;
  forms_reviewee_address: string;
  forms_job_id: string;
  forms_rating: string; // 1-5
  forms_comment: string;
  forms_skills_verified: string; // JSON array
  forms_completion_date: string;
  version: string;
}

/**
 * Signature Revision - Cryptographic proof of authenticity
 */
export interface SignatureRevision {
  previous_verification_hash: string;
  local_timestamp: string;
  revision_type: 'signature';
  signature: string;
  signature_public_key: string;
  signature_wallet_address: string;
  signature_type: string;
  version: string;
}

/**
 * Witness Revision - Optional blockchain anchoring
 */
export interface WitnessRevision {
  previous_verification_hash: string;
  local_timestamp: string;
  revision_type: 'witness';
  witness_network: string; // 'base-sepolia' | 'ethereum' | 'nostr'
  witness_event_id: string;
  witness_hash: string;
  witness_sender_account_address: string;
  witness_merkle_proof: string[];
  version: string;
}

/**
 * Complete Aqua Revision Chain
 */
export interface AquaRevisionChain {
  revisions: {
    [verification_hash: string]: FormRevision | SignatureRevision | WitnessRevision;
  };
  tree: {
    hash: string;
    children: any[];
  };
}

/**
 * Review with Aqua verification
 */
export interface VerifiableReview {
  id?: string;
  jobId: string;
  reviewerAddress: string;
  revieweeAddress: string;
  rating: number;
  comment: string;
  skillsVerified: string[];
  completionDate: string;
  aquaChain: AquaRevisionChain;
  verificationStatus: 'pending' | 'verified' | 'failed';
  createdAt: number;
}

/**
 * Reputation Score with verification metadata
 */
export interface ReputationScore {
  address: string;
  totalReviews: number;
  averageRating: number;
  verifiedReviews: number;
  unverifiedReviews: number;
  trustScore: number; // 0-100
  skillsEndorsed: { [skill: string]: number };
  recentReviews: VerifiableReview[];
  onChainProof: boolean;
}

/**
 * Generate current timestamp in Aqua format (YYYYMMDDHHMMSS)
 */
function getAquaTimestamp(): string {
  const now = new Date();
  return [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, '0'),
    String(now.getUTCDate()).padStart(2, '0'),
    String(now.getUTCHours()).padStart(2, '0'),
    String(now.getUTCMinutes()).padStart(2, '0'),
    String(now.getUTCSeconds()).padStart(2, '0'),
  ].join('');
}

/**
 * Calculate SHA256 hash (Aqua Protocol standard)
 */
async function calculateSHA256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Create canonical JSON (sorted keys, no whitespace)
 */
function canonicalJSON(obj: any): string {
  if (obj === null) return 'null';
  if (typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return '[' + obj.map(canonicalJSON).join(',') + ']';
  
  const keys = Object.keys(obj).sort();
  const pairs = keys.map(key => `"${key}":${canonicalJSON(obj[key])}`);
  return '{' + pairs.join(',') + '}';
}

/**
 * Calculate verification hash for a revision
 */
async function calculateVerificationHash(revision: any): Promise<string> {
  const canonical = canonicalJSON(revision);
  return await calculateSHA256(canonical);
}

/**
 * Generate random nonce for file hashing
 */
function generateNonce(): string {
  return '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Sign a review using Ethereum wallet (EIP-191)
 */
export async function signReview(
  provider: ethers.BrowserProvider,
  verificationHash: string
): Promise<{ signature: string; publicKey: string; address: string }> {
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  
  // Aqua Protocol standard message format
  const message = `I sign the following page verification_hash:" +[${verificationHash}]`;
  
  // Sign using EIP-191 (personal_sign)
  const signature = await signer.signMessage(message);
  
  // Recover public key from signature
  const messageHash = ethers.hashMessage(message);
  const publicKey = ethers.SigningKey.recoverPublicKey(messageHash, signature);
  
  return {
    signature,
    publicKey,
    address,
  };
}

/**
 * Create a verifiable review with Aqua Protocol
 */
export async function createVerifiableReview(
  provider: ethers.BrowserProvider,
  reviewData: {
    jobId: string;
    revieweeAddress: string;
    rating: number;
    comment: string;
    skillsVerified: string[];
    completionDate: string;
  }
): Promise<VerifiableReview> {
  const signer = await provider.getSigner();
  const reviewerAddress = await signer.getAddress();
  
  // Step 1: Create Form Revision
  const nonce = generateNonce();
  const formContent = {
    reviewer: reviewerAddress,
    reviewee: reviewData.revieweeAddress,
    job: reviewData.jobId,
    rating: reviewData.rating,
    comment: reviewData.comment,
    skills: reviewData.skillsVerified,
    completed: reviewData.completionDate,
  };
  
  const formContentString = canonicalJSON(formContent);
  const fileHash = await calculateSHA256(formContentString + nonce);
  
  const formRevision: FormRevision = {
    previous_verification_hash: '', // First revision
    local_timestamp: getAquaTimestamp(),
    revision_type: 'form',
    file_hash: fileHash,
    file_nonce: nonce,
    forms_reviewer_address: reviewerAddress,
    forms_reviewee_address: reviewData.revieweeAddress,
    forms_job_id: reviewData.jobId,
    forms_rating: reviewData.rating.toString(),
    forms_comment: reviewData.comment,
    forms_skills_verified: JSON.stringify(reviewData.skillsVerified),
    forms_completion_date: reviewData.completionDate,
    version: AQUA_VERSION,
  };
  
  const formVerificationHash = await calculateVerificationHash(formRevision);
  
  // Step 2: Create Signature Revision
  const signatureData = await signReview(provider, formVerificationHash);
  
  const signatureRevision: SignatureRevision = {
    previous_verification_hash: formVerificationHash,
    local_timestamp: getAquaTimestamp(),
    revision_type: 'signature',
    signature: signatureData.signature,
    signature_public_key: signatureData.publicKey,
    signature_wallet_address: signatureData.address,
    signature_type: SIGNATURE_TYPE,
    version: AQUA_VERSION,
  };
  
  const signatureVerificationHash = await calculateVerificationHash(signatureRevision);
  
  // Step 3: Build Aqua Revision Chain
  const aquaChain: AquaRevisionChain = {
    revisions: {
      [formVerificationHash]: formRevision,
      [signatureVerificationHash]: signatureRevision,
    },
    tree: {
      hash: signatureVerificationHash,
      children: [],
    },
  };
  
  // Step 4: Create Verifiable Review
  const verifiableReview: VerifiableReview = {
    jobId: reviewData.jobId,
    reviewerAddress,
    revieweeAddress: reviewData.revieweeAddress,
    rating: reviewData.rating,
    comment: reviewData.comment,
    skillsVerified: reviewData.skillsVerified,
    completionDate: reviewData.completionDate,
    aquaChain,
    verificationStatus: 'pending',
    createdAt: Date.now(),
  };
  
  // Step 5: Store in Firebase
  if (!db) throw new Error('Firebase not initialized');
  const reviewsRef = collection(db as Firestore, 'aqua_reviews');
  const docRef = await addDoc(reviewsRef, verifiableReview);
  
  verifiableReview.id = docRef.id;
  
  return verifiableReview;
}

/**
 * Verify an Aqua review chain
 */
export async function verifyReviewChain(review: VerifiableReview): Promise<boolean> {
  try {
    const { revisions } = review.aquaChain;
    const hashes = Object.keys(revisions);
    
    if (hashes.length < 2) return false;
    
    // Step 1: Verify Form Revision
    const formHash = hashes[0];
    const formRevision = revisions[formHash] as FormRevision;
    
    const recalculatedFormHash = await calculateVerificationHash(formRevision);
    if (recalculatedFormHash !== formHash) {
      console.error('Form revision hash mismatch');
      return false;
    }
    
    // Step 2: Verify Signature Revision
    const sigHash = hashes[1];
    const sigRevision = revisions[sigHash] as SignatureRevision;
    
    if (sigRevision.previous_verification_hash !== formHash) {
      console.error('Signature revision chain broken');
      return false;
    }
    
    const recalculatedSigHash = await calculateVerificationHash(sigRevision);
    if (recalculatedSigHash !== sigHash) {
      console.error('Signature revision hash mismatch');
      return false;
    }
    
    // Step 3: Verify Cryptographic Signature
    const message = `I sign the following page verification_hash:" +[${formHash}]`;
    const recoveredAddress = ethers.verifyMessage(message, sigRevision.signature);
    
    if (recoveredAddress.toLowerCase() !== sigRevision.signature_wallet_address.toLowerCase()) {
      console.error('Signature verification failed');
      return false;
    }
    
    // Step 4: Verify it matches the reviewer
    if (recoveredAddress.toLowerCase() !== review.reviewerAddress.toLowerCase()) {
      console.error('Reviewer address mismatch');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Review verification error:', error);
    return false;
  }
}

/**
 * Get reputation score for an address
 */
export async function getReputationScore(address: string): Promise<ReputationScore> {
  if (!db) throw new Error('Firebase not initialized');
  const reviewsRef = collection(db as Firestore, 'aqua_reviews');
  const q = query(
    reviewsRef,
    where('revieweeAddress', '==', address.toLowerCase()),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  const reviews = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as VerifiableReview[];
  
  // Verify all reviews
  const verificationResults = await Promise.all(
    reviews.map(async (review) => ({
      review,
      isVerified: await verifyReviewChain(review),
    }))
  );
  
  const verifiedReviews = verificationResults.filter(r => r.isVerified).map(r => r.review);
  const unverifiedReviews = verificationResults.filter(r => !r.isVerified).map(r => r.review);
  
  // Calculate average rating (only from verified reviews)
  const totalRating = verifiedReviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = verifiedReviews.length > 0 ? totalRating / verifiedReviews.length : 0;
  
  // Calculate trust score (percentage of verified reviews)
  const trustScore = reviews.length > 0
    ? Math.round((verifiedReviews.length / reviews.length) * 100)
    : 0;
  
  // Aggregate endorsed skills
  const skillsEndorsed: { [skill: string]: number } = {};
  verifiedReviews.forEach(review => {
    review.skillsVerified.forEach(skill => {
      skillsEndorsed[skill] = (skillsEndorsed[skill] || 0) + 1;
    });
  });
  
  // Check if any reviews are anchored on-chain
  const onChainProof = reviews.some(r => 
    Object.values(r.aquaChain.revisions).some(rev => rev.revision_type === 'witness')
  );
  
  return {
    address,
    totalReviews: reviews.length,
    averageRating,
    verifiedReviews: verifiedReviews.length,
    unverifiedReviews: unverifiedReviews.length,
    trustScore,
    skillsEndorsed,
    recentReviews: verifiedReviews.slice(0, 5),
    onChainProof,
  };
}

/**
 * Get all reviews for a specific address
 */
export async function getVerifiedReviews(address: string): Promise<VerifiableReview[]> {
  if (!db) throw new Error('Firebase not initialized');
  const reviewsRef = collection(db as Firestore, 'aqua_reviews');
  const q = query(
    reviewsRef,
    where('revieweeAddress', '==', address.toLowerCase()),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  const reviews = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as VerifiableReview[];
  
  // Verify and return only verified reviews
  const verifiedReviews = [];
  for (const review of reviews) {
    if (await verifyReviewChain(review)) {
      verifiedReviews.push(review);
    }
  }
  
  return verifiedReviews;
}

/**
 * Combat review fraud - detect suspicious patterns
 */
export function detectFraudPatterns(reviews: VerifiableReview[]): {
  suspicious: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  
  // Check for duplicate signatures
  const signatures = new Set();
  reviews.forEach(review => {
    const sigRevision = Object.values(review.aquaChain.revisions).find(
      r => r.revision_type === 'signature'
    ) as SignatureRevision;
    
    if (sigRevision && signatures.has(sigRevision.signature)) {
      reasons.push('Duplicate signature detected');
    }
    signatures.add(sigRevision?.signature);
  });
  
  // Check for same reviewer multiple times
  const reviewerCounts = new Map<string, number>();
  reviews.forEach(review => {
    const count = reviewerCounts.get(review.reviewerAddress) || 0;
    reviewerCounts.set(review.reviewerAddress, count + 1);
  });
  
  reviewerCounts.forEach((count, reviewer) => {
    if (count > 3) {
      reasons.push(`Same reviewer (${reviewer}) left ${count} reviews`);
    }
  });
  
  // Check for rapid-fire reviews (all within 1 hour)
  if (reviews.length > 5) {
    const timestamps = reviews.map(r => r.createdAt);
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const timeDiff = maxTime - minTime;
    
    if (timeDiff < 3600000) { // 1 hour in ms
      reasons.push('Multiple reviews submitted within 1 hour');
    }
  }
  
  return {
    suspicious: reasons.length > 0,
    reasons,
  };
}
