// FreelanceEscrow Contract ABI
export const FreelanceEscrowABI = [
  "function createContract(address _freelancer, string memory _jobId, string[] memory _milestoneTitles, string[] memory _milestoneDescriptions, uint256[] memory _milestoneAmounts, uint256[] memory _milestoneDeadlines) external payable returns (bytes32)",
  "function submitMilestone(bytes32 contractId, uint256 milestoneIndex) external",
  "function approveMilestone(bytes32 contractId, uint256 milestoneIndex) external",
  "function getContract(bytes32 contractId) external view returns (address client, address freelancer, string memory jobId, uint256 totalAmount, uint256 createdAt, uint8 status, uint256 milestoneCount)",
  "function getMilestone(bytes32 contractId, uint256 milestoneIndex) external view returns (string memory title, string memory description, uint256 amount, uint256 deadline, uint8 status, uint256 submittedAt, uint256 approvedAt)",
  "function getUserContracts(address user) external view returns (bytes32[] memory)",
  "event ContractCreated(bytes32 indexed contractId, address indexed client, address indexed freelancer, string jobId, uint256 totalAmount)",
  "event MilestoneSubmitted(bytes32 indexed contractId, uint256 milestoneIndex, uint256 timestamp)",
  "event MilestoneApproved(bytes32 indexed contractId, uint256 milestoneIndex, uint256 timestamp)",
  "event PaymentReleased(bytes32 indexed contractId, uint256 milestoneIndex, address indexed freelancer, uint256 amount)"
] as const;

// ReviewSystem Contract ABI
export const ReviewSystemABI = [
  "function submitReview(address _reviewee, string memory _contractId, uint8 _rating, string memory _comment) external returns (bytes32)",
  "function getReview(bytes32 reviewId) external view returns (address reviewer, address reviewee, string memory contractId, uint8 rating, string memory comment, uint256 timestamp)",
  "function getReputation(address _user) external view returns (uint256 totalReviews, uint256 averageRating)",
  "function getUserReviews(address _user) external view returns (bytes32[] memory)",
  "function hasReviewedContract(string memory _contractId, address _reviewer) external view returns (bool)",
  "event ReviewSubmitted(bytes32 indexed reviewId, address indexed reviewer, address indexed reviewee, string contractId, uint8 rating, uint256 timestamp)",
  "event ReputationUpdated(address indexed user, uint256 totalReviews, uint256 averageRating)"
] as const;

export const ESCROW_CONTRACT_ADDRESS = import.meta.env.VITE_ESCROW_CONTRACT_ADDRESS as `0x${string}`;
export const REVIEW_CONTRACT_ADDRESS = import.meta.env.VITE_REVIEW_CONTRACT_ADDRESS as `0x${string}`;
