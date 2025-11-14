// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title JobEscrow
 * @dev Manages escrow payments for job contracts on the Taalanta platform
 * @notice This contract holds funds until job completion and handles disputes
 */
contract JobEscrow {
    
    struct EscrowPayment {
        address client;
        address payable freelancer;
        uint256 projectAmount;
        uint256 serviceFee;
        uint256 totalAmount;
        uint256 createdAt;
        uint256 fundedAt;
        uint256 releasedAt;
        PaymentStatus status;
        bool disputed;
        string jobId; // UUID from Supabase
    }
    
    enum PaymentStatus {
        CREATED,
        FUNDED,
        RELEASED,
        REFUNDED,
        DISPUTED
    }
    
    // Platform owner (receives service fees)
    address payable public platformOwner;
    
    // Platform fee rate (in basis points, e.g., 1000 = 10%)
    uint256 public platformFeeRate;
    
    // Mapping from escrow ID to payment details
    mapping(bytes32 => EscrowPayment) public escrows;
    
    // Mapping from job ID to escrow ID
    mapping(string => bytes32) public jobToEscrow;
    
    // Dispute resolution timeout (default 30 days)
    uint256 public disputeTimeout = 30 days;
    
    // Events
    event EscrowCreated(
        bytes32 indexed escrowId,
        string indexed jobId,
        address indexed client,
        uint256 totalAmount
    );
    
    event EscrowFunded(
        bytes32 indexed escrowId,
        string indexed jobId,
        uint256 amount,
        uint256 serviceFee
    );
    
    event EscrowReleased(
        bytes32 indexed escrowId,
        string indexed jobId,
        address indexed freelancer,
        uint256 amount
    );
    
    event EscrowRefunded(
        bytes32 indexed escrowId,
        string indexed jobId,
        address indexed client,
        uint256 amount
    );
    
    event DisputeRaised(
        bytes32 indexed escrowId,
        string indexed jobId,
        address indexed initiator
    );
    
    event DisputeResolved(
        bytes32 indexed escrowId,
        string indexed jobId,
        bool clientFavored
    );
    
    // Modifiers
    modifier onlyPlatformOwner() {
        require(msg.sender == platformOwner, "Only platform owner can call this");
        _;
    }
    
    modifier escrowExists(bytes32 escrowId) {
        require(escrows[escrowId].client != address(0), "Escrow does not exist");
        _;
    }
    
    modifier onlyClient(bytes32 escrowId) {
        require(msg.sender == escrows[escrowId].client, "Only client can call this");
        _;
    }
    
    modifier onlyFreelancer(bytes32 escrowId) {
        require(msg.sender == escrows[escrowId].freelancer, "Only freelancer can call this");
        _;
    }
    
    constructor(uint256 _platformFeeRate) {
        require(_platformFeeRate <= 2000, "Fee rate cannot exceed 20%");
        platformOwner = payable(msg.sender);
        platformFeeRate = _platformFeeRate; // e.g., 1000 for 10%
    }
    
    /**
     * @dev Create and fund an escrow for a job
     * @param jobId The unique job identifier from the database
     * @param freelancerAddress The freelancer's wallet address (can be zero initially)
     */
    function createAndFundEscrow(
        string memory jobId,
        address payable freelancerAddress
    ) external payable returns (bytes32) {
        require(msg.value > 0, "Must send payment");
        require(bytes(jobId).length > 0, "Job ID cannot be empty");
        require(jobToEscrow[jobId] == bytes32(0), "Escrow already exists for this job");
        
        // Calculate amounts
        uint256 totalAmount = msg.value;
        uint256 serviceFee = (totalAmount * platformFeeRate) / (10000 + platformFeeRate);
        uint256 projectAmount = totalAmount - serviceFee;
        
        // Generate unique escrow ID
        bytes32 escrowId = keccak256(
            abi.encodePacked(jobId, msg.sender, block.timestamp)
        );
        
        // Create escrow
        escrows[escrowId] = EscrowPayment({
            client: msg.sender,
            freelancer: freelancerAddress,
            projectAmount: projectAmount,
            serviceFee: serviceFee,
            totalAmount: totalAmount,
            createdAt: block.timestamp,
            fundedAt: block.timestamp,
            releasedAt: 0,
            status: PaymentStatus.FUNDED,
            disputed: false,
            jobId: jobId
        });
        
        jobToEscrow[jobId] = escrowId;
        
        emit EscrowCreated(escrowId, jobId, msg.sender, totalAmount);
        emit EscrowFunded(escrowId, jobId, projectAmount, serviceFee);
        
        return escrowId;
    }
    
    /**
     * @dev Set freelancer address after job is assigned
     * @param escrowId The escrow identifier
     * @param freelancerAddress The freelancer's wallet address
     */
    function setFreelancer(
        bytes32 escrowId,
        address payable freelancerAddress
    ) external escrowExists(escrowId) onlyClient(escrowId) {
        require(freelancerAddress != address(0), "Invalid freelancer address");
        require(escrows[escrowId].status == PaymentStatus.FUNDED, "Escrow not in funded status");
        require(escrows[escrowId].freelancer == address(0), "Freelancer already set");
        
        escrows[escrowId].freelancer = freelancerAddress;
    }
    
    /**
     * @dev Release payment to freelancer upon job completion
     * @param escrowId The escrow identifier
     */
    function releasePayment(bytes32 escrowId) 
        external 
        escrowExists(escrowId) 
        onlyClient(escrowId) 
    {
        EscrowPayment storage escrow = escrows[escrowId];
        
        require(escrow.status == PaymentStatus.FUNDED, "Escrow not in funded status");
        require(escrow.freelancer != address(0), "Freelancer not set");
        require(!escrow.disputed, "Escrow is disputed");
        
        escrow.status = PaymentStatus.RELEASED;
        escrow.releasedAt = block.timestamp;
        
        // Transfer project amount to freelancer
        escrow.freelancer.transfer(escrow.projectAmount);
        
        // Transfer service fee to platform
        platformOwner.transfer(escrow.serviceFee);
        
        emit EscrowReleased(escrowId, escrow.jobId, escrow.freelancer, escrow.projectAmount);
    }
    
    /**
     * @dev Refund payment to client (only before freelancer is assigned or if disputed)
     * @param escrowId The escrow identifier
     */
    function refundPayment(bytes32 escrowId) 
        external 
        escrowExists(escrowId)
    {
        EscrowPayment storage escrow = escrows[escrowId];
        
        require(escrow.status == PaymentStatus.FUNDED, "Escrow not in funded status");
        require(
            msg.sender == escrow.client || msg.sender == platformOwner,
            "Only client or platform owner can refund"
        );
        
        // Can only refund if no freelancer assigned or if platform owner resolves dispute
        if (msg.sender == escrow.client) {
            require(escrow.freelancer == address(0), "Cannot refund after freelancer assigned");
        }
        
        escrow.status = PaymentStatus.REFUNDED;
        
        // Refund full amount to client
        payable(escrow.client).transfer(escrow.totalAmount);
        
        emit EscrowRefunded(escrowId, escrow.jobId, escrow.client, escrow.totalAmount);
    }
    
    /**
     * @dev Raise a dispute on an escrow
     * @param escrowId The escrow identifier
     */
    function raiseDispute(bytes32 escrowId) 
        external 
        escrowExists(escrowId) 
    {
        EscrowPayment storage escrow = escrows[escrowId];
        
        require(
            msg.sender == escrow.client || msg.sender == escrow.freelancer,
            "Only client or freelancer can raise dispute"
        );
        require(escrow.status == PaymentStatus.FUNDED, "Escrow not in funded status");
        require(!escrow.disputed, "Dispute already raised");
        
        escrow.disputed = true;
        escrow.status = PaymentStatus.DISPUTED;
        
        emit DisputeRaised(escrowId, escrow.jobId, msg.sender);
    }
    
    /**
     * @dev Resolve a dispute (only platform owner)
     * @param escrowId The escrow identifier
     * @param favorClient True to refund client, false to pay freelancer
     */
    function resolveDispute(
        bytes32 escrowId,
        bool favorClient
    ) external escrowExists(escrowId) onlyPlatformOwner {
        EscrowPayment storage escrow = escrows[escrowId];
        
        require(escrow.status == PaymentStatus.DISPUTED, "Escrow not disputed");
        require(escrow.freelancer != address(0), "Freelancer not set");
        
        if (favorClient) {
            escrow.status = PaymentStatus.REFUNDED;
            // Refund to client (minus a small platform fee for dispute resolution)
            uint256 refundAmount = escrow.totalAmount - (escrow.serviceFee / 2);
            payable(escrow.client).transfer(refundAmount);
            platformOwner.transfer(escrow.serviceFee / 2);
        } else {
            escrow.status = PaymentStatus.RELEASED;
            escrow.releasedAt = block.timestamp;
            // Pay freelancer
            escrow.freelancer.transfer(escrow.projectAmount);
            platformOwner.transfer(escrow.serviceFee);
        }
        
        emit DisputeResolved(escrowId, escrow.jobId, favorClient);
    }
    
    /**
     * @dev Get escrow details by job ID
     * @param jobId The job identifier
     */
    function getEscrowByJobId(string memory jobId) 
        external 
        view 
        returns (
            bytes32 escrowId,
            address client,
            address freelancer,
            uint256 projectAmount,
            uint256 serviceFee,
            uint256 totalAmount,
            PaymentStatus status,
            bool disputed
        ) 
    {
        escrowId = jobToEscrow[jobId];
        require(escrowId != bytes32(0), "No escrow found for this job");
        
        EscrowPayment memory escrow = escrows[escrowId];
        return (
            escrowId,
            escrow.client,
            escrow.freelancer,
            escrow.projectAmount,
            escrow.serviceFee,
            escrow.totalAmount,
            escrow.status,
            escrow.disputed
        );
    }
    
    /**
     * @dev Update platform fee rate
     * @param newRate New fee rate in basis points
     */
    function updateFeeRate(uint256 newRate) external onlyPlatformOwner {
        require(newRate <= 2000, "Fee rate cannot exceed 20%");
        platformFeeRate = newRate;
    }
    
    /**
     * @dev Update dispute timeout
     * @param newTimeout New timeout in seconds
     */
    function updateDisputeTimeout(uint256 newTimeout) external onlyPlatformOwner {
        require(newTimeout >= 7 days, "Timeout must be at least 7 days");
        disputeTimeout = newTimeout;
    }
    
    /**
     * @dev Emergency withdraw (only for stuck funds, requires dispute timeout)
     * @param escrowId The escrow identifier
     */
    function emergencyWithdraw(bytes32 escrowId) 
        external 
        escrowExists(escrowId) 
    {
        EscrowPayment storage escrow = escrows[escrowId];
        
        require(
            msg.sender == escrow.client || msg.sender == escrow.freelancer,
            "Only client or freelancer can withdraw"
        );
        require(escrow.status == PaymentStatus.FUNDED, "Escrow not in funded status");
        require(
            block.timestamp >= escrow.fundedAt + disputeTimeout,
            "Dispute timeout not reached"
        );
        
        if (msg.sender == escrow.freelancer) {
            // Freelancer can withdraw after timeout if no dispute
            require(!escrow.disputed, "Cannot withdraw during dispute");
            escrow.status = PaymentStatus.RELEASED;
            escrow.releasedAt = block.timestamp;
            escrow.freelancer.transfer(escrow.projectAmount);
            platformOwner.transfer(escrow.serviceFee);
        } else {
            // Client can withdraw only if no freelancer assigned
            require(escrow.freelancer == address(0), "Freelancer already assigned");
            escrow.status = PaymentStatus.REFUNDED;
            payable(escrow.client).transfer(escrow.totalAmount);
        }
    }
    
    /**
     * @dev Get contract balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
