# Authentication & Job Management Features

This implementation adds comprehensive user authentication and job management functionality to TalentBridge.

## Features Implemented

### 1. User Authentication
- **Sign Up**: Create account as either Freelancer or Client
- **Sign In**: Email/password authentication
- **User Profiles**: Role-based profiles with custom fields
- **Protected Routes**: Dashboard and job posting require authentication

### 2. User Roles

#### Freelancer
- Browse available jobs
- Apply to jobs
- View application history
- See matching jobs based on skills

#### Client
- Post new jobs
- Manage posted jobs
- View applicants
- Track job status

### 3. Job Management
- **Create Jobs**: Full job posting form with:
  - Title, description, category
  - Skills requirements
  - Budget (fixed-price or hourly)
  - Duration and deadline
  - Location (remote option)
  - Experience level

- **Browse Jobs**: 
  - Filter by category, skills, budget
  - See job details
  - Apply with one click

- **Job Status**: open, in-progress, completed, cancelled

## File Structure

```
src/
├── lib/
│   ├── auth.ts              # Authentication functions
│   └── jobs.ts              # Job CRUD operations
├── context/
│   └── AuthContext.tsx      # Global auth state
├── pages/
│   ├── SignUpPage.tsx       # Registration page
│   ├── SignInPage.tsx       # Login page
│   ├── DashboardPage.tsx    # Role-based dashboard
│   ├── PostJobPage.tsx      # Job creation form
│   └── JobDetailPage.tsx    # Job details & apply
└── components/
    ├── FreelancerDashboard.tsx  # Freelancer view
    └── ClientDashboard.tsx      # Client view
```

## Firebase Collections

### `users`
```javascript
{
  uid: string,
  email: string,
  role: 'freelancer' | 'client',
  displayName: string,
  walletAddress?: string,
  
  // Freelancer fields
  bio?: string,
  skills?: string[],
  hourlyRate?: number,
  portfolio?: string,
  
  // Client fields
  companyName?: string,
  companyWebsite?: string,
  industry?: string,
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `jobs`
```javascript
{
  id: string,
  title: string,
  description: string,
  category: string,
  skills: string[],
  budget: number,
  jobType: 'fixed-price' | 'hourly',
  experienceLevel: 'beginner' | 'intermediate' | 'expert',
  duration: string,
  
  clientId: string,
  clientName: string,
  clientAddress?: string,
  
  status: 'open' | 'in-progress' | 'completed' | 'cancelled',
  applicants: string[],  // Array of freelancer UIDs
  selectedFreelancer?: string,
  
  location?: string,
  remote: boolean,
  deadline?: string,
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Usage

### Sign Up
1. Navigate to `/signup`
2. Enter email, password, full name
3. Select role (Freelancer or Client)
4. Click "Create Account"

### Post a Job (Client)
1. Sign in as a Client
2. Click "Post a New Job" from dashboard
3. Fill in job details:
   - Title and description
   - Category and required skills
   - Budget and job type
   - Duration and experience level
   - Location (optional)
4. Click "Post Job"

### Apply to Jobs (Freelancer)
1. Sign in as a Freelancer
2. Browse available jobs on dashboard
3. Click "View Details" on any job
4. Click "Apply for this Job"

## Key Features

### Authentication
- Firebase Auth for email/password
- Firestore for user profiles
- AuthContext for global state
- Protected routes with redirects

### Job Posting
- Rich form with validation
- Category selection
- Dynamic skills tags
- Budget calculator
- Remote work option
- Application deadline

### Job Browsing
- Grid/card layout
- Filter by category, skills, budget
- Skill matching indicator
- Application tracking
- Real-time status updates

### Dashboard
- Role-specific views
- Stats overview
- Quick actions
- Job management

## Security

- Firebase Auth rules enforce authentication
- Firestore security rules protect user data
- Client-side validation
- Server-side timestamp for audit trail
- User UID used for all associations

## Next Steps

1. **Add smart contract integration** for escrow
2. **Implement messaging** between clients and freelancers
3. **Add proposal system** for detailed applications
4. **Create rating system** post-job completion
5. **Add email notifications** for job updates
6. **Implement file uploads** for portfolios/attachments
7. **Add payment processing** integration
8. **Create admin panel** for moderation

## Testing

### Test Accounts
Create test accounts with:
- Freelancer: `freelancer@test.com`
- Client: `client@test.com`

### Test Flow
1. Create client account
2. Post a job
3. Create freelancer account
4. Browse and apply to job
5. View applicants as client

## Troubleshooting

**Cannot sign in**: Check Firebase configuration in `.env`
**Jobs not loading**: Verify Firestore rules allow read access
**Application fails**: Ensure user is authenticated as freelancer
**Post job fails**: Ensure user is authenticated as client

## Routes

- `/signup` - User registration
- `/signin` - User login
- `/dashboard` - Role-based dashboard (protected)
- `/post-job` - Create job posting (client only, protected)
- `/job/:id` - Job details and application
- `/jobs` - Browse all jobs

---

Built with Firebase Authentication, Firestore, React, TypeScript, and Tailwind CSS.
