/**
 * Job Management
 * CRUD operations for job postings
 */

import { 
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  Firestore,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

export type JobStatus = 'open' | 'in-progress' | 'completed' | 'cancelled';
export type JobType = 'fixed-price' | 'hourly';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'expert';

export interface JobPosting {
  id?: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  budget: number;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  duration: string;
  
  // Client info
  clientId: string;
  clientName: string;
  clientAddress?: string;
  
  // Status
  status: JobStatus;
  featured?: boolean;
  
  // Applications
  applicants?: string[]; // Array of freelancer UIDs
  selectedFreelancer?: string;
  
  // Timestamps
  createdAt: any;
  updatedAt: any;
  deadline?: string;
  
  // Additional
  attachments?: string[];
  location?: string;
  remote?: boolean;
}

/**
 * Create a new job posting (Client only)
 */
export async function createJob(jobData: Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<string> {
  if (!db) throw new Error('Firebase not initialized');

  const job: Omit<JobPosting, 'id'> = {
    ...jobData,
    status: 'open',
    applicants: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db as Firestore, 'jobs'), job);
  return docRef.id;
}

/**
 * Get all open jobs (for Freelancers)
 */
export async function getOpenJobs(filters?: {
  category?: string;
  skills?: string[];
  minBudget?: number;
  maxBudget?: number;
}): Promise<JobPosting[]> {
  if (!db) throw new Error('Firebase not initialized');

  let q = query(
    collection(db as Firestore, 'jobs'),
    where('status', '==', 'open'),
    orderBy('createdAt', 'desc')
  );

  if (filters?.category) {
    q = query(q, where('category', '==', filters.category));
  }

  const snapshot = await getDocs(q);
  const jobs = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as JobPosting[];

  // Client-side filtering for more complex queries
  let filteredJobs = jobs;

  if (filters?.skills && filters.skills.length > 0) {
    filteredJobs = filteredJobs.filter(job =>
      filters.skills!.some(skill => job.skills.includes(skill))
    );
  }

  if (filters?.minBudget !== undefined) {
    filteredJobs = filteredJobs.filter(job => job.budget >= filters.minBudget!);
  }

  if (filters?.maxBudget !== undefined) {
    filteredJobs = filteredJobs.filter(job => job.budget <= filters.maxBudget!);
  }

  return filteredJobs;
}

/**
 * Get jobs posted by a specific client
 */
export async function getClientJobs(clientId: string): Promise<JobPosting[]> {
  if (!db) throw new Error('Firebase not initialized');

  const q = query(
    collection(db as Firestore, 'jobs'),
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as JobPosting[];
}

/**
 * Get a single job by ID
 */
export async function getJob(jobId: string): Promise<JobPosting | null> {
  if (!db) throw new Error('Firebase not initialized');

  const docRef = doc(db as Firestore, 'jobs', jobId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as JobPosting;
}

/**
 * Update a job posting
 */
export async function updateJob(
  jobId: string,
  updates: Partial<JobPosting>
): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');

  const jobRef = doc(db as Firestore, 'jobs', jobId);
  await updateDoc(jobRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a job posting
 */
export async function deleteJob(jobId: string): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');

  const jobRef = doc(db as Firestore, 'jobs', jobId);
  await deleteDoc(jobRef);
}

/**
 * Apply to a job (Freelancer)
 */
export async function applyToJob(
  jobId: string,
  freelancerId: string
): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');

  const jobRef = doc(db as Firestore, 'jobs', jobId);
  const jobSnap = await getDoc(jobRef);

  if (!jobSnap.exists()) {
    throw new Error('Job not found');
  }

  const job = jobSnap.data() as JobPosting;
  const applicants = job.applicants || [];

  if (applicants.includes(freelancerId)) {
    throw new Error('Already applied to this job');
  }

  await updateDoc(jobRef, {
    applicants: [...applicants, freelancerId],
    updatedAt: serverTimestamp(),
  });
}

/**
 * Get jobs a freelancer has applied to
 */
export async function getAppliedJobs(freelancerId: string): Promise<JobPosting[]> {
  if (!db) throw new Error('Firebase not initialized');

  const q = query(
    collection(db as Firestore, 'jobs'),
    where('applicants', 'array-contains', freelancerId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as JobPosting[];
}

/**
 * Select a freelancer for a job (Client)
 */
export async function selectFreelancer(
  jobId: string,
  freelancerId: string
): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');

  await updateDoc(doc(db as Firestore, 'jobs', jobId), {
    selectedFreelancer: freelancerId,
    status: 'in-progress',
    updatedAt: serverTimestamp(),
  });
}

/**
 * Complete a job
 */
export async function completeJob(jobId: string): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');

  await updateDoc(doc(db as Firestore, 'jobs', jobId), {
    status: 'completed',
    updatedAt: serverTimestamp(),
  });
}

/**
 * Cancel a job
 */
export async function cancelJob(jobId: string): Promise<void> {
  if (!db) throw new Error('Firebase not initialized');

  await updateDoc(doc(db as Firestore, 'jobs', jobId), {
    status: 'cancelled',
    updatedAt: serverTimestamp(),
  });
}
