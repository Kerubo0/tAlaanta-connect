export interface User {
  id: string;
  address: string;
  userType: 'freelancer' | 'client';
  displayName: string;
  bio?: string;
  skills?: string[];
  hourlyRate?: number;
  portfolio?: PortfolioItem[];
  profileImage?: string;
  createdAt: number;
  reputation: number;
  totalEarned?: number;
  totalSpent?: number;
  completedJobs: number;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ipfsHash?: string;
  link?: string;
}

export interface Job {
  id: string;
  clientId: string;
  clientAddress: string;
  title: string;
  description: string;
  skills: string[];
  budget: number;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: number;
  deadline?: number;
  proposals: number;
  category?: string;
  featured?: boolean;
  duration?: string;
  clientName?: string;
}

export interface Proposal {
  id: string;
  jobId: string;
  freelancerId: string;
  freelancerAddress: string;
  coverLetter: string;
  proposedRate: number;
  estimatedDuration: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}

export interface Contract {
  id: string;
  jobId: string;
  clientId: string;
  clientAddress: string;
  freelancerId: string;
  freelancerAddress: string;
  title: string;
  description: string;
  totalAmount: number;
  milestones: Milestone[];
  status: 'active' | 'completed' | 'disputed' | 'cancelled';
  createdAt: number;
  contractAddress?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  deadline: number;
  status: 'pending' | 'in-progress' | 'submitted' | 'approved' | 'paid';
  submittedAt?: number;
  approvedAt?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderAddress: string;
  text: string;
  timestamp: number;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantAddresses: string[];
  lastMessage?: string;
  lastMessageTimestamp?: number;
  unreadCount: { [userId: string]: number };
}

export interface Review {
  id: string;
  contractId: string;
  reviewerId: string;
  reviewerAddress: string;
  revieweeId: string;
  revieweeAddress: string;
  rating: number;
  comment: string;
  createdAt: number;
  txHash?: string;
}
