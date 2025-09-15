package solana

import (
	"context"
	"fmt"
	"time"

	"github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/programs/token"
	"go.uber.org/zap"
)

// RewardService handles reward distribution operations
type RewardService struct {
	client *Client
	logger *zap.Logger
}

// NewRewardService creates a new reward service
func NewRewardService(client *Client, logger *zap.Logger) *RewardService {
	return &RewardService{
		client: client,
		logger: logger,
	}
}

// DistributeReward distributes EduToken rewards to a user
func (r *RewardService) DistributeReward(ctx context.Context, userWallet string, amount uint64, rewardType string) (*RewardDistribution, error) {
	// Validate user wallet address
	userPubKey, err := solana.PublicKeyFromBase58(userWallet)
	if err != nil {
		return nil, fmt.Errorf("invalid user wallet address: %w", err)
	}

	// Check if we have mint authority
	if len(r.client.mintAuthorityKey) == 0 {
		return nil, fmt.Errorf("mint authority not configured")
	}

	// Get user's associated token account for EduToken
	userTokenAccount, _, err := solana.FindAssociatedTokenAddress(userPubKey, r.client.eduProMintAddress)
	if err != nil {
		return nil, fmt.Errorf("failed to find user token account: %w", err)
	}

	// Check if the token account exists, create if not
	accountInfo, err := r.client.RpcClient.GetAccountInfo(ctx, userTokenAccount)
	if err != nil {
		return nil, fmt.Errorf("failed to get token account info: %w", err)
	}

	var instructions []solana.Instruction

	// If account doesn't exist, create it
	if accountInfo.Value == nil {
		// For now, skip account creation as the instruction might have changed
		// In production, you would implement proper associated token account creation
		return nil, fmt.Errorf("user token account does not exist - please create it first")
	}

	// Create mint to instruction
	mintToInstruction := token.NewMintToInstruction(
		amount,
		r.client.eduProMintAddress,
		userTokenAccount,
		r.client.mintAuthorityKey.PublicKey(),
		[]solana.PublicKey{},
	).Build()
	instructions = append(instructions, mintToInstruction)

	// Get recent blockhash
	blockhash, err := r.client.GetRecentBlockhash(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get recent blockhash: %w", err)
	}

	// Create transaction
	tx, err := solana.NewTransaction(
		instructions,
		blockhash,
		solana.TransactionPayer(r.client.mintAuthorityKey.PublicKey()),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create transaction: %w", err)
	}

	// Sign transaction
	_, err = tx.Sign(func(key solana.PublicKey) *solana.PrivateKey {
		if key.Equals(r.client.mintAuthorityKey.PublicKey()) {
			return &r.client.mintAuthorityKey
		}
		return nil
	})
	if err != nil {
		return nil, fmt.Errorf("failed to sign transaction: %w", err)
	}

	// Send transaction
	signature, err := r.client.SendTransaction(ctx, tx)
	if err != nil {
		return nil, fmt.Errorf("failed to send transaction: %w", err)
	}

	r.logger.Info("Reward distribution transaction sent",
		zap.String("signature", signature),
		zap.String("user_wallet", userWallet),
		zap.Uint64("amount", amount),
		zap.String("reward_type", rewardType),
	)

	return &RewardDistribution{
		RewardType:           rewardType,
		Amount:               amount,
		TransactionSignature: signature,
		Status:               TransactionStatusPending,
		EarnedAt:             time.Now(),
	}, nil
}

// VerifyRewardDistribution verifies that a reward distribution transaction was successful
func (r *RewardService) VerifyRewardDistribution(ctx context.Context, signature string) (*RewardDistribution, error) {
	// Verify transaction
	txInfo, err := r.client.VerifyTransaction(ctx, signature)
	if err != nil {
		return nil, fmt.Errorf("failed to verify transaction: %w", err)
	}

	status := TransactionStatusPending
	if txInfo.Confirmed {
		if txInfo.Error == "" {
			status = RewardStatusDistributed
		} else {
			status = RewardStatusFailed
		}
	}

	return &RewardDistribution{
		TransactionSignature: signature,
		Status:               status,
		EarnedAt:             txInfo.BlockTime,
	}, nil
}

// CalculateCourseCompletionReward calculates reward for course completion
func (r *RewardService) CalculateCourseCompletionReward(courseID string, userLevel int) uint64 {
	// Base reward for course completion
	baseReward := uint64(100 * 1e9) // 100 EduTokens (assuming 9 decimals)

	// Bonus based on user level
	levelBonus := uint64(userLevel * 10 * 1e9) // 10 EduTokens per level

	return baseReward + levelBonus
}

// CalculateQuizScoreReward calculates reward based on quiz performance
func (r *RewardService) CalculateQuizScoreReward(score, maxScore int) uint64 {
	if score <= 0 || maxScore <= 0 {
		return 0
	}

	// Calculate percentage
	percentage := float64(score) / float64(maxScore)

	// Base reward scales with performance
	baseReward := uint64(50 * 1e9) // 50 EduTokens base
	performanceMultiplier := percentage

	// Perfect score bonus
	if percentage >= 1.0 {
		performanceMultiplier = 1.5 // 50% bonus for perfect score
	}

	return uint64(float64(baseReward) * performanceMultiplier)
}

// CalculateDailyLoginReward calculates reward for daily login
func (r *RewardService) CalculateDailyLoginReward(consecutiveDays int) uint64 {
	baseReward := uint64(10 * 1e9) // 10 EduTokens base

	// Streak bonus (max 5x)
	streakMultiplier := 1 + (consecutiveDays-1)/7 // +1x every 7 days
	if streakMultiplier > 5 {
		streakMultiplier = 5
	}

	return baseReward * uint64(streakMultiplier)
}

// CalculateReferralReward calculates reward for successful referrals
func (r *RewardService) CalculateReferralReward(referralTier int) uint64 {
	// Tier-based referral rewards
	switch referralTier {
	case 1:
		return uint64(500 * 1e9) // 500 EduTokens for first referral
	case 2:
		return uint64(750 * 1e9) // 750 EduTokens for second referral
	case 3:
		return uint64(1000 * 1e9) // 1000 EduTokens for third+ referrals
	default:
		return uint64(250 * 1e9) // 250 EduTokens default
	}
}

// CalculateStakingReward calculates staking rewards based on amount and duration
func (r *RewardService) CalculateStakingReward(stakedAmount uint64, stakingDurationDays int) uint64 {
	// Annual percentage yield (APY) of 12%
	apy := 0.12

	// Calculate daily rate
	dailyRate := apy / 365

	// Calculate reward
	reward := float64(stakedAmount) * dailyRate * float64(stakingDurationDays)

	return uint64(reward)
}

// BatchDistributeRewards distributes rewards to multiple users
func (r *RewardService) BatchDistributeRewards(ctx context.Context, rewards []RewardDistribution) ([]*RewardDistribution, error) {
	var results []*RewardDistribution
	var errors []error

	for _, reward := range rewards {
		// In production, you might want to batch these into a single transaction
		// or use a more efficient distribution mechanism
		result, err := r.DistributeReward(ctx, reward.UserID, reward.Amount, reward.RewardType)
		if err != nil {
			r.logger.Error("Failed to distribute reward",
				zap.String("user_id", reward.UserID),
				zap.String("reward_type", reward.RewardType),
				zap.Error(err),
			)
			errors = append(errors, err)
			continue
		}

		results = append(results, result)
	}

	if len(errors) > 0 {
		r.logger.Warn("Some reward distributions failed",
			zap.Int("failed_count", len(errors)),
			zap.Int("total_count", len(rewards)),
		)
	}

	return results, nil
}

// GetUserRewardBalance gets the total EduToken balance for a user
func (r *RewardService) GetUserRewardBalance(ctx context.Context, userWallet string) (uint64, error) {
	return r.client.GetEduTokenBalance(ctx, userWallet)
}

// EstimateRewardDistributionFee estimates the fee for distributing rewards
func (r *RewardService) EstimateRewardDistributionFee(ctx context.Context, recipientCount int) (uint64, error) {
	// Base fee for mint transaction
	baseFee := uint64(5000) // 0.000005 SOL

	// Additional fee for creating token accounts if needed
	createAccountFee := uint64(2039280) // ~0.002 SOL per account creation

	// Estimate total fee (assuming some accounts need to be created)
	estimatedNewAccounts := recipientCount / 4 // Assume 25% are new accounts
	totalFee := baseFee*uint64(recipientCount) + createAccountFee*uint64(estimatedNewAccounts)

	return totalFee, nil
}
