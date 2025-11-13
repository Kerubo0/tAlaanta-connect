/**
 * Job Management
 * CRUD operations for job postings using Supabase
 */

import { supabase } from './supabase';

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
  job_type: JobType;
  experience_level: ExperienceLevel;
  duration: string;
  
  // Client info
  client_id: string;
  client_name: string;
  client_address?: string;
  
  // Status
  status: JobStatus;
  featured?: boolean;
  
  // Applications
  applicants?: string[]; // Array of freelancer UIDs
  selected_freelancer?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  deadline?: string;
  
  // Additional
  attachments?: string[];
  location?: string;
  remote?: boolean;
}

/**
 * Create a new job posting (Client only)
 */
export async function createJob(jobData: Omit<JobPosting, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<string> {
  if (!supabase) throw new Error('Supabase not initialized');

  const job: any = {
    ...jobData,
    status: 'open',
    applicants: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Remove undefined fields
  Object.keys(job).forEach(key => {
    if (job[key] === undefined) {
      delete job[key];
    }
  });

  const { data, error } = await supabase
    .from('jobs')
    .insert([job])
    .select()
    .single();

  if (error) throw error;
  return data.id;
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
  if (!supabase) throw new Error('Supabase not initialized');

  let query = supabase
    .from('jobs')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.minBudget) {
    query = query.gte('budget', filters.minBudget);
  }

  if (filters?.maxBudget) {
    query = query.lte('budget', filters.maxBudget);
  }

  // Note: Skills filtering needs to be done client-side or with a custom SQL function
  const { data, error } = await query;

  if (error) throw error;

  let jobs = data as JobPosting[];

  // Filter by skills client-side
  if (filters?.skills && filters.skills.length > 0) {
    jobs = jobs.filter(job =>
      filters.skills!.some(skill =>
        job.skills?.includes(skill)
      )
    );
  }

  return jobs;
}

/**
 * Get jobs posted by a specific client
 */
export async function getClientJobs(clientId: string): Promise<JobPosting[]> {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as JobPosting[];
}

/**
 * Get a single job by ID
 */
export async function getJob(jobId: string): Promise<JobPosting | null> {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) return null;
  return data as JobPosting;
}

/**
 * Apply to a job (Freelancer)
 */
export async function applyToJob(jobId: string, freelancerId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not initialized');

  // Get current job
  const job = await getJob(jobId);
  if (!job) throw new Error('Job not found');

  const applicants = job.applicants || [];
  if (applicants.includes(freelancerId)) {
    throw new Error('Already applied to this job');
  }

  // Add freelancer to applicants
  const { error } = await supabase
    .from('jobs')
    .update({
      applicants: [...applicants, freelancerId],
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  if (error) throw error;
}

/**
 * Get jobs a freelancer has applied to
 */
export async function getAppliedJobs(freelancerId: string): Promise<JobPosting[]> {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .contains('applicants', [freelancerId])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as JobPosting[];
}

/**
 * Select a freelancer for the job (Client)
 */
export async function selectFreelancer(jobId: string, freelancerId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not initialized');

  const { error } = await supabase
    .from('jobs')
    .update({
      selected_freelancer: freelancerId,
      status: 'in-progress',
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  if (error) throw error;
}

/**
 * Update a job
 */
export async function updateJob(jobId: string, updates: Partial<JobPosting>): Promise<void> {
  if (!supabase) throw new Error('Supabase not initialized');

  const { error } = await supabase
    .from('jobs')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  if (error) throw error;
}

/**
 * Delete a job
 */
export async function deleteJob(jobId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not initialized');

  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', jobId);

  if (error) throw error;
}

/**
 * Mark job as completed
 */
export async function completeJob(jobId: string): Promise<void> {
  await updateJob(jobId, { status: 'completed' });
}

/**
 * Cancel a job
 */
export async function cancelJob(jobId: string): Promise<void> {
  await updateJob(jobId, { status: 'cancelled' });
}
