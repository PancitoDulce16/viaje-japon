/**
 * 🤝 COLLABORATIVE FILTERING - FASE 3.2
 * ======================================
 *
 * Sistema de recomendación basado en lo que usuarios similares disfrutaron.
 *
 * "Los viajeros como tú también disfrutaron..."
 *
 * Técnicas:
 * - User-User Collaborative Filtering
 * - Item-Item Collaborative Filtering
 * - Matrix Factorization (SVD simplificado)
 * - Similarity Metrics (Cosine, Pearson, Jaccard)
 * - Hybrid Recommendations
 *
 * Inspiración:
 * - Netflix recommendations
 * - Amazon "Customers who bought also bought"
 * - Spotify Discover Weekly
 */

class CollaborativeFiltering {
  constructor() {
    this.initialized = false;

    // User-item interaction matrix
    this.userItemMatrix = new Map(); // userId -> Map(itemId -> rating)

    // Precomputed similarities
    this.userSimilarities = new Map(); // userId -> Map(userId -> similarity)
    this.itemSimilarities = new Map(); // itemId -> Map(itemId -> similarity)

    // Item metadata
    this.items = new Map(); // itemId -> item data

    // Configuration
    this.config = {
      minSimilarity: 0.3,
      topKNeighbors: 10,
      minCommonItems: 2,
      defaultRating: 3.0
    };

    console.log('🤝 Collaborative Filtering initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Load historical user-item interactions
    await this.loadInteractions();

    // Precompute similarities
    await this.computeSimilarities();

    this.initialized = true;
    console.log(`✅ Collaborative Filtering initialized: ${this.userItemMatrix.size} users, ${this.items.size} items`);
  }

  async loadInteractions() {
    if (!window.MLStorage) {
      console.warn('MLStorage not available, using empty interaction matrix');
      return;
    }

    try {
      // Load patterns that represent user interactions
      const patterns = await window.MLStorage.getPatterns();

      patterns.forEach(pattern => {
        if (pattern.type === 'activity_rating' || pattern.type === 'activity_interaction') {
          this.addInteraction(
            pattern.userId,
            pattern.data.itemId,
            pattern.data.rating || this.inferRating(pattern.data)
          );
        }
      });

      console.log(`📥 Loaded ${this.userItemMatrix.size} user interaction histories`);
    } catch (error) {
      console.warn('Could not load interactions:', error);
    }
  }

  inferRating(interactionData) {
    // Infer implicit rating from interaction data
    let rating = 3.0; // Neutral

    if (interactionData.completed) rating += 1.0;
    if (interactionData.liked) rating += 1.5;
    if (interactionData.bookmarked) rating += 0.5;
    if (interactionData.shared) rating += 0.5;
    if (interactionData.timeSpent > 300) rating += 0.5; // > 5 min

    return Math.min(5.0, Math.max(1.0, rating));
  }

  // ============================================
  // 📝 DATA MANAGEMENT
  // ============================================

  /**
   * Add user-item interaction
   */
  addInteraction(userId, itemId, rating, metadata = {}) {
    if (!this.userItemMatrix.has(userId)) {
      this.userItemMatrix.set(userId, new Map());
    }

    this.userItemMatrix.get(userId).set(itemId, {
      rating,
      timestamp: Date.now(),
      ...metadata
    });

    // Add item if not exists
    if (!this.items.has(itemId)) {
      this.items.set(itemId, {
        id: itemId,
        ...metadata.itemData
      });
    }

    // Invalidate similarity cache for this user
    if (this.userSimilarities.has(userId)) {
      this.userSimilarities.delete(userId);
    }
  }

  /**
   * Get user's ratings
   */
  getUserRatings(userId) {
    return this.userItemMatrix.get(userId) || new Map();
  }

  /**
   * Get item's ratings from all users
   */
  getItemRatings(itemId) {
    const ratings = new Map();

    this.userItemMatrix.forEach((items, userId) => {
      if (items.has(itemId)) {
        ratings.set(userId, items.get(itemId));
      }
    });

    return ratings;
  }

  // ============================================
  // 📊 SIMILARITY COMPUTATION
  // ============================================

  /**
   * Compute all user-user similarities
   */
  async computeSimilarities() {
    console.log('🔄 Computing user similarities...');

    const users = Array.from(this.userItemMatrix.keys());

    for (let i = 0; i < users.length; i++) {
      if (!this.userSimilarities.has(users[i])) {
        this.userSimilarities.set(users[i], new Map());
      }

      for (let j = i + 1; j < users.length; j++) {
        const similarity = this.computeUserSimilarity(users[i], users[j]);

        if (similarity >= this.config.minSimilarity) {
          this.userSimilarities.get(users[i]).set(users[j], similarity);

          if (!this.userSimilarities.has(users[j])) {
            this.userSimilarities.set(users[j], new Map());
          }
          this.userSimilarities.get(users[j]).set(users[i], similarity);
        }
      }
    }

    console.log(`✅ Computed similarities for ${users.length} users`);
  }

  /**
   * Compute similarity between two users
   */
  computeUserSimilarity(userId1, userId2, method = 'cosine') {
    const ratings1 = this.getUserRatings(userId1);
    const ratings2 = this.getUserRatings(userId2);

    // Find common items
    const commonItems = [];
    ratings1.forEach((rating, itemId) => {
      if (ratings2.has(itemId)) {
        commonItems.push({
          item: itemId,
          rating1: rating.rating,
          rating2: ratings2.get(itemId).rating
        });
      }
    });

    // Need minimum common items
    if (commonItems.length < this.config.minCommonItems) {
      return 0;
    }

    switch (method) {
      case 'cosine':
        return this.cosineSimilarity(commonItems);
      case 'pearson':
        return this.pearsonCorrelation(commonItems);
      case 'jaccard':
        return this.jaccardSimilarity(ratings1, ratings2);
      default:
        return this.cosineSimilarity(commonItems);
    }
  }

  cosineSimilarity(commonItems) {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    commonItems.forEach(({ rating1, rating2 }) => {
      dotProduct += rating1 * rating2;
      norm1 += rating1 * rating1;
      norm2 += rating2 * rating2;
    });

    if (norm1 === 0 || norm2 === 0) return 0;

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  pearsonCorrelation(commonItems) {
    const n = commonItems.length;
    if (n === 0) return 0;

    // Calculate means
    const mean1 = commonItems.reduce((sum, item) => sum + item.rating1, 0) / n;
    const mean2 = commonItems.reduce((sum, item) => sum + item.rating2, 0) / n;

    let numerator = 0;
    let sumSq1 = 0;
    let sumSq2 = 0;

    commonItems.forEach(({ rating1, rating2 }) => {
      const diff1 = rating1 - mean1;
      const diff2 = rating2 - mean2;

      numerator += diff1 * diff2;
      sumSq1 += diff1 * diff1;
      sumSq2 += diff2 * diff2;
    });

    if (sumSq1 === 0 || sumSq2 === 0) return 0;

    return numerator / (Math.sqrt(sumSq1) * Math.sqrt(sumSq2));
  }

  jaccardSimilarity(ratings1, ratings2) {
    const set1 = new Set(ratings1.keys());
    const set2 = new Set(ratings2.keys());

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  /**
   * Compute item-item similarity
   */
  computeItemSimilarity(itemId1, itemId2) {
    const ratings1 = this.getItemRatings(itemId1);
    const ratings2 = this.getItemRatings(itemId2);

    // Find common users
    const commonUsers = [];
    ratings1.forEach((rating, userId) => {
      if (ratings2.has(userId)) {
        commonUsers.push({
          user: userId,
          rating1: rating.rating,
          rating2: ratings2.get(userId).rating
        });
      }
    });

    if (commonUsers.length < this.config.minCommonItems) {
      return 0;
    }

    return this.cosineSimilarity(commonUsers);
  }

  // ============================================
  // 🎯 USER-USER COLLABORATIVE FILTERING
  // ============================================

  /**
   * Recommend items based on similar users
   */
  async recommendByUsers(userId, topK = 10) {
    const userRatings = this.getUserRatings(userId);

    // Get similar users
    const similarUsers = this.getSimilarUsers(userId, this.config.topKNeighbors);

    if (similarUsers.length === 0) {
      return this.getPopularItems(topK);
    }

    // Aggregate recommendations from similar users
    const itemScores = new Map();

    similarUsers.forEach(({ userId: similarUserId, similarity }) => {
      const theirRatings = this.getUserRatings(similarUserId);

      theirRatings.forEach((ratingData, itemId) => {
        // Skip items user already rated
        if (userRatings.has(itemId)) return;

        const weightedRating = ratingData.rating * similarity;

        if (!itemScores.has(itemId)) {
          itemScores.set(itemId, {
            totalWeight: 0,
            totalSimilarity: 0,
            contributors: []
          });
        }

        const score = itemScores.get(itemId);
        score.totalWeight += weightedRating;
        score.totalSimilarity += similarity;
        score.contributors.push({
          userId: similarUserId,
          rating: ratingData.rating,
          similarity
        });
      });
    });

    // Calculate final scores
    const recommendations = [];

    itemScores.forEach((scoreData, itemId) => {
      const predictedRating = scoreData.totalWeight / scoreData.totalSimilarity;

      recommendations.push({
        itemId,
        item: this.items.get(itemId),
        predictedRating,
        confidence: this.calculateConfidence(scoreData),
        reason: `Recommended by ${scoreData.contributors.length} similar travelers`,
        contributors: scoreData.contributors.slice(0, 3) // Top 3
      });
    });

    // Sort by predicted rating
    recommendations.sort((a, b) => b.predictedRating - a.predictedRating);

    return recommendations.slice(0, topK);
  }

  getSimilarUsers(userId, k) {
    const similarities = this.userSimilarities.get(userId);

    if (!similarities || similarities.size === 0) {
      return [];
    }

    const similarUsers = [];
    similarities.forEach((similarity, otherUserId) => {
      similarUsers.push({ userId: otherUserId, similarity });
    });

    return similarUsers
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);
  }

  calculateConfidence(scoreData) {
    // Confidence based on number of contributors and their similarity
    const numContributors = scoreData.contributors.length;
    const avgSimilarity = scoreData.totalSimilarity / numContributors;

    // More contributors + higher similarity = higher confidence
    const contributorFactor = Math.min(numContributors / 5, 1.0); // Max at 5 contributors
    const similarityFactor = avgSimilarity;

    return ((contributorFactor + similarityFactor) / 2).toFixed(2);
  }

  // ============================================
  // 🎯 ITEM-ITEM COLLABORATIVE FILTERING
  // ============================================

  /**
   * Recommend items based on item similarity
   */
  async recommendByItems(userId, topK = 10) {
    const userRatings = this.getUserRatings(userId);

    if (userRatings.size === 0) {
      return this.getPopularItems(topK);
    }

    // Find items similar to what user liked
    const itemScores = new Map();

    userRatings.forEach((ratingData, likedItemId) => {
      // Only consider items user rated highly
      if (ratingData.rating < 3.5) return;

      // Find similar items
      this.items.forEach((item, candidateItemId) => {
        // Skip items user already rated
        if (userRatings.has(candidateItemId)) return;

        const similarity = this.computeItemSimilarity(likedItemId, candidateItemId);

        if (similarity >= this.config.minSimilarity) {
          const weightedScore = ratingData.rating * similarity;

          if (!itemScores.has(candidateItemId)) {
            itemScores.set(candidateItemId, {
              totalWeight: 0,
              totalSimilarity: 0,
              basedOn: []
            });
          }

          const score = itemScores.get(candidateItemId);
          score.totalWeight += weightedScore;
          score.totalSimilarity += similarity;
          score.basedOn.push({
            itemId: likedItemId,
            similarity,
            userRating: ratingData.rating
          });
        }
      });
    });

    // Calculate final scores
    const recommendations = [];

    itemScores.forEach((scoreData, itemId) => {
      const predictedRating = scoreData.totalWeight / scoreData.totalSimilarity;

      recommendations.push({
        itemId,
        item: this.items.get(itemId),
        predictedRating,
        confidence: (scoreData.totalSimilarity / scoreData.basedOn.length).toFixed(2),
        reason: `Similar to activities you enjoyed`,
        basedOn: scoreData.basedOn.slice(0, 3) // Top 3
      });
    });

    recommendations.sort((a, b) => b.predictedRating - a.predictedRating);

    return recommendations.slice(0, topK);
  }

  // ============================================
  // 🎯 HYBRID RECOMMENDATIONS
  // ============================================

  /**
   * Combine user-user and item-item recommendations
   */
  async hybridRecommendations(userId, topK = 10, userWeight = 0.5, itemWeight = 0.5) {
    const [userRecs, itemRecs] = await Promise.all([
      this.recommendByUsers(userId, topK * 2),
      this.recommendByItems(userId, topK * 2)
    ]);

    // Merge recommendations
    const combinedScores = new Map();

    userRecs.forEach(rec => {
      combinedScores.set(rec.itemId, {
        ...rec,
        hybridScore: rec.predictedRating * userWeight,
        sources: ['user-user']
      });
    });

    itemRecs.forEach(rec => {
      if (combinedScores.has(rec.itemId)) {
        const existing = combinedScores.get(rec.itemId);
        existing.hybridScore += rec.predictedRating * itemWeight;
        existing.sources.push('item-item');
        existing.confidence = Math.max(parseFloat(existing.confidence), parseFloat(rec.confidence));
      } else {
        combinedScores.set(rec.itemId, {
          ...rec,
          hybridScore: rec.predictedRating * itemWeight,
          sources: ['item-item']
        });
      }
    });

    // Sort by hybrid score
    const finalRecommendations = Array.from(combinedScores.values())
      .sort((a, b) => b.hybridScore - a.hybridScore)
      .slice(0, topK);

    // Add diversity boost if needed
    return this.diversifyRecommendations(finalRecommendations);
  }

  /**
   * Ensure diversity in recommendations
   */
  diversifyRecommendations(recommendations, diversityWeight = 0.3) {
    if (recommendations.length <= 3) return recommendations;

    const diversified = [recommendations[0]]; // Always include top recommendation
    const remaining = recommendations.slice(1);

    while (diversified.length < recommendations.length && remaining.length > 0) {
      let maxDiversityScore = -1;
      let bestIndex = 0;

      remaining.forEach((candidate, index) => {
        // Calculate diversity score (how different from already selected)
        let diversityScore = 0;

        diversified.forEach(selected => {
          const itemSimilarity = this.computeItemSimilarity(candidate.itemId, selected.itemId);
          diversityScore += (1 - itemSimilarity); // Higher score = more different
        });

        diversityScore /= diversified.length;

        // Combine with predicted rating
        const combinedScore = (1 - diversityWeight) * candidate.hybridScore +
                             diversityWeight * diversityScore * 5; // Scale diversity to ~5

        if (combinedScore > maxDiversityScore) {
          maxDiversityScore = combinedScore;
          bestIndex = index;
        }
      });

      diversified.push(remaining[bestIndex]);
      remaining.splice(bestIndex, 1);
    }

    return diversified;
  }

  // ============================================
  // 📊 UTILITY FUNCTIONS
  // ============================================

  /**
   * Get popular items (fallback when no personalization available)
   */
  getPopularItems(topK = 10) {
    const itemPopularity = new Map();

    this.userItemMatrix.forEach(ratings => {
      ratings.forEach((ratingData, itemId) => {
        if (!itemPopularity.has(itemId)) {
          itemPopularity.set(itemId, {
            totalRating: 0,
            count: 0
          });
        }

        const pop = itemPopularity.get(itemId);
        pop.totalRating += ratingData.rating;
        pop.count += 1;
      });
    });

    const popularItems = [];

    itemPopularity.forEach((data, itemId) => {
      const avgRating = data.totalRating / data.count;

      popularItems.push({
        itemId,
        item: this.items.get(itemId),
        avgRating,
        numRatings: data.count,
        popularityScore: avgRating * Math.log(data.count + 1), // Weighted by number of ratings
        reason: 'Popular among all travelers'
      });
    });

    return popularItems
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, topK);
  }

  /**
   * Predict rating for specific user-item pair
   */
  predictRating(userId, itemId) {
    const userRatings = this.getUserRatings(userId);

    // If user already rated it, return that
    if (userRatings.has(itemId)) {
      return userRatings.get(itemId).rating;
    }

    // Get similar users who rated this item
    const similarUsers = this.getSimilarUsers(userId, this.config.topKNeighbors);

    let weightedSum = 0;
    let totalSimilarity = 0;

    similarUsers.forEach(({ userId: similarUserId, similarity }) => {
      const theirRatings = this.getUserRatings(similarUserId);

      if (theirRatings.has(itemId)) {
        weightedSum += theirRatings.get(itemId).rating * similarity;
        totalSimilarity += similarity;
      }
    });

    if (totalSimilarity === 0) {
      // Fallback to item average
      const itemRatings = this.getItemRatings(itemId);
      if (itemRatings.size === 0) return this.config.defaultRating;

      let sum = 0;
      itemRatings.forEach(ratingData => {
        sum += ratingData.rating;
      });

      return sum / itemRatings.size;
    }

    return weightedSum / totalSimilarity;
  }

  /**
   * Evaluate recommendation quality (if we have test data)
   */
  evaluateRecommendations(testSet) {
    // testSet = array of { userId, itemId, actualRating }

    let totalError = 0;
    let totalSquaredError = 0;
    let count = 0;

    testSet.forEach(({ userId, itemId, actualRating }) => {
      const predictedRating = this.predictRating(userId, itemId);
      const error = Math.abs(predictedRating - actualRating);

      totalError += error;
      totalSquaredError += error * error;
      count++;
    });

    const mae = totalError / count; // Mean Absolute Error
    const rmse = Math.sqrt(totalSquaredError / count); // Root Mean Squared Error

    return {
      mae: mae.toFixed(3),
      rmse: rmse.toFixed(3),
      testSize: count,
      interpretation: mae < 0.5 ? 'Excellent' : mae < 1.0 ? 'Good' : mae < 1.5 ? 'Fair' : 'Poor'
    };
  }

  // ============================================
  // 💾 PERSISTENCE
  // ============================================

  async saveState() {
    if (!window.MLStorage) return;

    const state = {
      interactions: Array.from(this.userItemMatrix.entries()).map(([userId, ratings]) => ({
        userId,
        ratings: Array.from(ratings.entries())
      })),
      items: Array.from(this.items.entries()),
      timestamp: Date.now()
    };

    await window.MLStorage.savePattern({
      type: 'collaborative_filtering_state',
      data: state,
      userId: 'system'
    });

    console.log('💾 Collaborative filtering state saved');
  }
}

// 🌐 Global instance
if (typeof window !== 'undefined') {
  window.CollaborativeFiltering = new CollaborativeFiltering();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.CollaborativeFiltering.initialize().catch(e => {
        console.error('Failed to initialize Collaborative Filtering:', e);
      });
    });
  } else {
    window.CollaborativeFiltering.initialize().catch(e => {
      console.error('Failed to initialize Collaborative Filtering:', e);
    });
  }
}

export default CollaborativeFiltering;
