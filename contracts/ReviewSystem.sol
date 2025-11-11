// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ReviewSystem
 * @dev On-chain review and reputation system for TalentBridge
 */
contract ReviewSystem {
    
    struct Review {
        address reviewer;
        address reviewee;
        string contractId;
        uint8 rating; // 1-5 stars
        string comment;
        uint256 timestamp;
        bool exists;
    }
    
    struct Reputation {
        uint256 totalReviews;
        uint256 totalRating;
        uint256 averageRating; // Stored as rating * 100 for precision
    }
    
    mapping(bytes32 => Review) public reviews;
    mapping(address => Reputation) public reputations;
    mapping(address => bytes32[]) public userReviews;
    mapping(string => mapping(address => bool)) public hasReviewed;
    
    event ReviewSubmitted(
        bytes32 indexed reviewId,
        address indexed reviewer,
        address indexed reviewee,
        string contractId,
        uint8 rating,
        uint256 timestamp
    );
    
    event ReputationUpdated(
        address indexed user,
        uint256 totalReviews,
        uint256 averageRating
    );
    
    /**
     * @dev Submit a review for a completed contract
     */
    function submitReview(
        address _reviewee,
        string memory _contractId,
        uint8 _rating,
        string memory _comment
    ) external returns (bytes32) {
        require(_reviewee != address(0), "Invalid reviewee address");
        require(_reviewee != msg.sender, "Cannot review yourself");
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");
        require(bytes(_contractId).length > 0, "Contract ID required");
        require(!hasReviewed[_contractId][msg.sender], "Already reviewed this contract");
        
        bytes32 reviewId = keccak256(
            abi.encodePacked(msg.sender, _reviewee, _contractId, block.timestamp)
        );
        
        reviews[reviewId] = Review({
            reviewer: msg.sender,
            reviewee: _reviewee,
            contractId: _contractId,
            rating: _rating,
            comment: _comment,
            timestamp: block.timestamp,
            exists: true
        });
        
        userReviews[_reviewee].push(reviewId);
        hasReviewed[_contractId][msg.sender] = true;
        
        // Update reputation
        updateReputation(_reviewee, _rating);
        
        emit ReviewSubmitted(
            reviewId,
            msg.sender,
            _reviewee,
            _contractId,
            _rating,
            block.timestamp
        );
        
        return reviewId;
    }
    
    /**
     * @dev Internal function to update user reputation
     */
    function updateReputation(address _user, uint8 _rating) internal {
        Reputation storage rep = reputations[_user];
        
        rep.totalReviews += 1;
        rep.totalRating += _rating;
        rep.averageRating = (rep.totalRating * 100) / rep.totalReviews;
        
        emit ReputationUpdated(_user, rep.totalReviews, rep.averageRating);
    }
    
    /**
     * @dev Get review details
     */
    function getReview(bytes32 reviewId) 
        external 
        view 
        returns (
            address reviewer,
            address reviewee,
            string memory contractId,
            uint8 rating,
            string memory comment,
            uint256 timestamp
        )
    {
        require(reviews[reviewId].exists, "Review does not exist");
        Review storage review = reviews[reviewId];
        return (
            review.reviewer,
            review.reviewee,
            review.contractId,
            review.rating,
            review.comment,
            review.timestamp
        );
    }
    
    /**
     * @dev Get user reputation
     */
    function getReputation(address _user) 
        external 
        view 
        returns (
            uint256 totalReviews,
            uint256 averageRating
        )
    {
        Reputation storage rep = reputations[_user];
        return (rep.totalReviews, rep.averageRating);
    }
    
    /**
     * @dev Get all reviews for a user
     */
    function getUserReviews(address _user) external view returns (bytes32[] memory) {
        return userReviews[_user];
    }
    
    /**
     * @dev Check if a user has already reviewed a contract
     */
    function hasReviewedContract(string memory _contractId, address _reviewer) 
        external 
        view 
        returns (bool) 
    {
        return hasReviewed[_contractId][_reviewer];
    }
}
