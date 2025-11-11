// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FreelanceEscrow
 * @dev Manages milestone-based payments for freelance contracts
 */
contract FreelanceEscrow {
    
    struct Milestone {
        string title;
        string description;
        uint256 amount;
        uint256 deadline;
        MilestoneStatus status;
        uint256 submittedAt;
        uint256 approvedAt;
    }
    
    struct EscrowContract {
        address client;
        address freelancer;
        string jobId;
        uint256 totalAmount;
        uint256 createdAt;
        ContractStatus status;
        Milestone[] milestones;
    }
    
    enum MilestoneStatus { Pending, InProgress, Submitted, Approved, Paid }
    enum ContractStatus { Active, Completed, Disputed, Cancelled }
    
    mapping(bytes32 => EscrowContract) public contracts;
    mapping(address => bytes32[]) public userContracts;
    
    uint256 public platformFee = 0; // 0% - zero platform fees
    address public owner;
    
    event ContractCreated(
        bytes32 indexed contractId,
        address indexed client,
        address indexed freelancer,
        string jobId,
        uint256 totalAmount
    );
    
    event MilestoneStatusUpdated(
        bytes32 indexed contractId,
        uint256 milestoneIndex,
        MilestoneStatus status
    );
    
    event MilestoneSubmitted(
        bytes32 indexed contractId,
        uint256 milestoneIndex,
        uint256 timestamp
    );
    
    event MilestoneApproved(
        bytes32 indexed contractId,
        uint256 milestoneIndex,
        uint256 timestamp
    );
    
    event PaymentReleased(
        bytes32 indexed contractId,
        uint256 milestoneIndex,
        address indexed freelancer,
        uint256 amount
    );
    
    event ContractStatusUpdated(
        bytes32 indexed contractId,
        ContractStatus status
    );
    
    modifier onlyClient(bytes32 contractId) {
        require(msg.sender == contracts[contractId].client, "Not contract client");
        _;
    }
    
    modifier onlyFreelancer(bytes32 contractId) {
        require(msg.sender == contracts[contractId].freelancer, "Not contract freelancer");
        _;
    }
    
    modifier contractExists(bytes32 contractId) {
        require(contracts[contractId].client != address(0), "Contract does not exist");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Create a new escrow contract with milestones
     */
    function createContract(
        address _freelancer,
        string memory _jobId,
        string[] memory _milestoneTitles,
        string[] memory _milestoneDescriptions,
        uint256[] memory _milestoneAmounts,
        uint256[] memory _milestoneDeadlines
    ) external payable returns (bytes32) {
        require(_freelancer != address(0), "Invalid freelancer address");
        require(_freelancer != msg.sender, "Cannot create contract with yourself");
        require(_milestoneTitles.length > 0, "At least one milestone required");
        require(
            _milestoneTitles.length == _milestoneDescriptions.length &&
            _milestoneTitles.length == _milestoneAmounts.length &&
            _milestoneTitles.length == _milestoneDeadlines.length,
            "Milestone arrays length mismatch"
        );
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < _milestoneAmounts.length; i++) {
            totalAmount += _milestoneAmounts[i];
        }
        
        require(msg.value == totalAmount, "Incorrect payment amount");
        
        bytes32 contractId = keccak256(
            abi.encodePacked(msg.sender, _freelancer, _jobId, block.timestamp)
        );
        
        EscrowContract storage newContract = contracts[contractId];
        newContract.client = msg.sender;
        newContract.freelancer = _freelancer;
        newContract.jobId = _jobId;
        newContract.totalAmount = totalAmount;
        newContract.createdAt = block.timestamp;
        newContract.status = ContractStatus.Active;
        
        for (uint256 i = 0; i < _milestoneTitles.length; i++) {
            newContract.milestones.push(Milestone({
                title: _milestoneTitles[i],
                description: _milestoneDescriptions[i],
                amount: _milestoneAmounts[i],
                deadline: _milestoneDeadlines[i],
                status: MilestoneStatus.Pending,
                submittedAt: 0,
                approvedAt: 0
            }));
        }
        
        userContracts[msg.sender].push(contractId);
        userContracts[_freelancer].push(contractId);
        
        emit ContractCreated(contractId, msg.sender, _freelancer, _jobId, totalAmount);
        
        return contractId;
    }
    
    /**
     * @dev Freelancer submits milestone for review
     */
    function submitMilestone(bytes32 contractId, uint256 milestoneIndex) 
        external 
        contractExists(contractId)
        onlyFreelancer(contractId)
    {
        EscrowContract storage escrowContract = contracts[contractId];
        require(escrowContract.status == ContractStatus.Active, "Contract not active");
        require(milestoneIndex < escrowContract.milestones.length, "Invalid milestone");
        
        Milestone storage milestone = escrowContract.milestones[milestoneIndex];
        require(
            milestone.status == MilestoneStatus.Pending || 
            milestone.status == MilestoneStatus.InProgress,
            "Milestone not in valid state"
        );
        
        milestone.status = MilestoneStatus.Submitted;
        milestone.submittedAt = block.timestamp;
        
        emit MilestoneSubmitted(contractId, milestoneIndex, block.timestamp);
        emit MilestoneStatusUpdated(contractId, milestoneIndex, MilestoneStatus.Submitted);
    }
    
    /**
     * @dev Client approves milestone and releases payment
     */
    function approveMilestone(bytes32 contractId, uint256 milestoneIndex) 
        external 
        contractExists(contractId)
        onlyClient(contractId)
    {
        EscrowContract storage escrowContract = contracts[contractId];
        require(escrowContract.status == ContractStatus.Active, "Contract not active");
        require(milestoneIndex < escrowContract.milestones.length, "Invalid milestone");
        
        Milestone storage milestone = escrowContract.milestones[milestoneIndex];
        require(milestone.status == MilestoneStatus.Submitted, "Milestone not submitted");
        
        milestone.status = MilestoneStatus.Approved;
        milestone.approvedAt = block.timestamp;
        
        emit MilestoneApproved(contractId, milestoneIndex, block.timestamp);
        emit MilestoneStatusUpdated(contractId, milestoneIndex, MilestoneStatus.Approved);
        
        // Release payment
        releaseMilestonePayment(contractId, milestoneIndex);
    }
    
    /**
     * @dev Internal function to release milestone payment
     */
    function releaseMilestonePayment(bytes32 contractId, uint256 milestoneIndex) 
        internal 
    {
        EscrowContract storage escrowContract = contracts[contractId];
        Milestone storage milestone = escrowContract.milestones[milestoneIndex];
        
        require(milestone.status == MilestoneStatus.Approved, "Milestone not approved");
        
        uint256 amount = milestone.amount;
        milestone.status = MilestoneStatus.Paid;
        
        // Transfer payment to freelancer (no platform fee)
        payable(escrowContract.freelancer).transfer(amount);
        
        emit PaymentReleased(contractId, milestoneIndex, escrowContract.freelancer, amount);
        
        // Check if all milestones are paid
        bool allPaid = true;
        for (uint256 i = 0; i < escrowContract.milestones.length; i++) {
            if (escrowContract.milestones[i].status != MilestoneStatus.Paid) {
                allPaid = false;
                break;
            }
        }
        
        if (allPaid) {
            escrowContract.status = ContractStatus.Completed;
            emit ContractStatusUpdated(contractId, ContractStatus.Completed);
        }
    }
    
    /**
     * @dev Update milestone status (for in-progress tracking)
     */
    function updateMilestoneStatus(
        bytes32 contractId, 
        uint256 milestoneIndex,
        MilestoneStatus newStatus
    ) 
        external 
        contractExists(contractId)
        onlyFreelancer(contractId)
    {
        EscrowContract storage escrowContract = contracts[contractId];
        require(escrowContract.status == ContractStatus.Active, "Contract not active");
        require(milestoneIndex < escrowContract.milestones.length, "Invalid milestone");
        
        Milestone storage milestone = escrowContract.milestones[milestoneIndex];
        require(
            newStatus == MilestoneStatus.InProgress || 
            newStatus == MilestoneStatus.Pending,
            "Invalid status update"
        );
        
        milestone.status = newStatus;
        emit MilestoneStatusUpdated(contractId, milestoneIndex, newStatus);
    }
    
    /**
     * @dev Get contract details
     */
    function getContract(bytes32 contractId) 
        external 
        view 
        contractExists(contractId)
        returns (
            address client,
            address freelancer,
            string memory jobId,
            uint256 totalAmount,
            uint256 createdAt,
            ContractStatus status,
            uint256 milestoneCount
        )
    {
        EscrowContract storage escrowContract = contracts[contractId];
        return (
            escrowContract.client,
            escrowContract.freelancer,
            escrowContract.jobId,
            escrowContract.totalAmount,
            escrowContract.createdAt,
            escrowContract.status,
            escrowContract.milestones.length
        );
    }
    
    /**
     * @dev Get milestone details
     */
    function getMilestone(bytes32 contractId, uint256 milestoneIndex)
        external
        view
        contractExists(contractId)
        returns (
            string memory title,
            string memory description,
            uint256 amount,
            uint256 deadline,
            MilestoneStatus status,
            uint256 submittedAt,
            uint256 approvedAt
        )
    {
        require(milestoneIndex < contracts[contractId].milestones.length, "Invalid milestone");
        Milestone storage milestone = contracts[contractId].milestones[milestoneIndex];
        return (
            milestone.title,
            milestone.description,
            milestone.amount,
            milestone.deadline,
            milestone.status,
            milestone.submittedAt,
            milestone.approvedAt
        );
    }
    
    /**
     * @dev Get all user contracts
     */
    function getUserContracts(address user) external view returns (bytes32[] memory) {
        return userContracts[user];
    }
}
