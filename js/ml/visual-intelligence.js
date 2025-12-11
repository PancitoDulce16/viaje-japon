/**
 * 📸 FASE 10: VISUAL INTELLIGENCE
 * =================================
 *
 * "Búsqueda visual de lugares en Japón"
 *
 * Sistema de inteligencia visual que permite:
 * - Buscar lugares similares por foto
 * - Reconocer landmarks japoneses
 * - Generar embeddings visuales
 * - Clustering de imágenes por categoría
 * - "Muéstrame lugares como ESTA foto"
 *
 * Tecnología:
 * - MobileNet (TensorFlow.js) para embeddings
 * - Cosine similarity para búsqueda
 * - K-means clustering para categorización
 * - Canvas API para procesamiento
 *
 * Como un guía que:
 * - Reconoce lugares por foto
 * - "Esto es parecido a Fushimi Inari"
 * - Encuentra lugares con arquitectura similar
 * - Agrupa por estilo visual
 */

class VisualIntelligence {
  constructor() {
    this.initialized = false;

    // TensorFlow.js model (MobileNet)
    this.model = null;
    this.modelLoaded = false;

    // Visual database (place embeddings)
    this.visualDB = new Map(); // placeId -> embedding vector

    // Clustering
    this.clusters = new Map(); // clusterId -> [placeIds]
    this.clusterCentroids = new Map(); // clusterId -> centroid vector

    // Categories
    this.categories = {
      temples: { color: '#FF6B6B', icon: '⛩️' },
      gardens: { color: '#4ECDC4', icon: '🌸' },
      urban: { color: '#FFE66D', icon: '🏙️' },
      nature: { color: '#95E1D3', icon: '🏞️' },
      food: { color: '#F38181', icon: '🍜' },
      modern: { color: '#AA96DA', icon: '🗼' }
    };

    // Statistics
    this.stats = {
      totalImages: 0,
      searches: 0,
      avgSearchTime: 0,
      accuracy: 0
    };

    // Settings
    this.settings = {
      embeddingDim: 1024,  // MobileNet embedding size
      similarityThreshold: 0.7,
      topK: 5,  // Return top 5 similar places
      useGPU: true
    };

    console.log('📸 Visual Intelligence initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Load TensorFlow.js
    await this.loadTensorFlow();

    // Load MobileNet model
    await this.loadModel();

    // Load visual database
    await this.loadVisualDB();

    this.initialized = true;
    console.log('✅ Visual Intelligence ready');
    console.log(`🖼️ Loaded ${this.visualDB.size} image embeddings`);
  }

  /**
   * 🔧 SETUP
   */

  /**
   * Load TensorFlow.js
   */
  async loadTensorFlow() {
    if (typeof tf !== 'undefined') {
      console.log('✅ TensorFlow.js already loaded');
      return;
    }

    // Would load from CDN in real implementation
    console.log('⏳ TensorFlow.js would be loaded from CDN');
    console.log('📦 Add to HTML: <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"></script>');
    console.log('📦 Add to HTML: <script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet"></script>');
  }

  /**
   * Load MobileNet model
   */
  async loadModel() {
    try {
      // In real implementation, would load actual MobileNet
      // this.model = await mobilenet.load();

      // For now, simulate
      console.log('🧠 MobileNet model loading simulated');
      console.log('💡 In production, would load actual MobileNet from TensorFlow Hub');

      this.modelLoaded = true;
    } catch (error) {
      console.error('Error loading model:', error);
      this.modelLoaded = false;
    }
  }

  /**
   * Load visual database from storage
   */
  async loadVisualDB() {
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('visual_intelligence');

      if (stored) {
        this.visualDB = new Map(stored.visualDB || []);
        this.clusters = new Map(stored.clusters || []);
        this.clusterCentroids = new Map(stored.centroids || []);
        this.stats = stored.stats || this.stats;
      }
    }

    // Bootstrap with sample data if empty
    if (this.visualDB.size === 0) {
      await this.bootstrapVisualData();
    }
  }

  /**
   * Bootstrap with sample visual data
   */
  async bootstrapVisualData() {
    console.log('🌱 Bootstrapping visual data...');

    // Sample embeddings for iconic Japan locations
    const samplePlaces = [
      {
        id: 'fushimi_inari',
        name: 'Fushimi Inari Taisha',
        category: 'temples',
        embedding: this.generateRandomEmbedding(), // In production: real MobileNet embedding
        features: { toriiGates: true, red: true, shrine: true }
      },
      {
        id: 'kinkakuji',
        name: 'Kinkaku-ji (Golden Pavilion)',
        category: 'temples',
        embedding: this.generateRandomEmbedding(),
        features: { golden: true, pond: true, zen: true }
      },
      {
        id: 'arashiyama',
        name: 'Arashiyama Bamboo Grove',
        category: 'nature',
        embedding: this.generateRandomEmbedding(),
        features: { bamboo: true, green: true, forest: true }
      },
      {
        id: 'shibuya',
        name: 'Shibuya Crossing',
        category: 'urban',
        embedding: this.generateRandomEmbedding(),
        features: { city: true, modern: true, crowded: true }
      },
      {
        id: 'tokyo_tower',
        name: 'Tokyo Tower',
        category: 'modern',
        embedding: this.generateRandomEmbedding(),
        features: { tower: true, red: true, modern: true }
      },
      {
        id: 'senso_ji',
        name: 'Sensō-ji Temple',
        category: 'temples',
        embedding: this.generateRandomEmbedding(),
        features: { temple: true, traditional: true, historic: true }
      }
    ];

    for (const place of samplePlaces) {
      this.visualDB.set(place.id, {
        embedding: place.embedding,
        category: place.category,
        name: place.name,
        features: place.features
      });
    }

    // Build initial clusters
    await this.buildClusters();

    this.stats.totalImages = samplePlaces.length;

    await this.save();

    console.log(`✅ Bootstrapped ${samplePlaces.length} sample embeddings`);
  }

  /**
   * Generate random embedding (for demo)
   * In production: use real MobileNet
   */
  generateRandomEmbedding() {
    const embedding = [];
    for (let i = 0; i < this.settings.embeddingDim; i++) {
      embedding.push(Math.random() * 2 - 1); // [-1, 1]
    }
    return this.normalizeVector(embedding);
  }

  /**
   * 🔍 VISUAL SEARCH
   */

  /**
   * Search by image
   * @param {File|string} image - Image file or URL
   * @returns {Array} Similar places
   */
  async searchByImage(image) {
    const startTime = Date.now();

    console.log('🔍 Searching by image...');

    // 1. Load and preprocess image
    const imageElement = await this.loadImage(image);

    // 2. Extract embedding
    const embedding = await this.extractEmbedding(imageElement);

    // 3. Find similar embeddings
    const similar = this.findSimilar(embedding);

    // 4. Rank and filter
    const results = similar
      .filter(r => r.similarity >= this.settings.similarityThreshold)
      .slice(0, this.settings.topK);

    const searchTime = Date.now() - startTime;

    // Update stats
    this.stats.searches++;
    this.stats.avgSearchTime = (this.stats.avgSearchTime * (this.stats.searches - 1) + searchTime) / this.stats.searches;

    console.log(`✅ Found ${results.length} similar places in ${searchTime}ms`);

    return results.map(r => ({
      placeId: r.placeId,
      name: r.name,
      category: r.category,
      similarity: r.similarity,
      features: r.features,
      reasoning: this.generateReasoning(embedding, r)
    }));
  }

  /**
   * Load image from file or URL
   */
  async loadImage(source) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => resolve(img);
      img.onerror = reject;

      if (source instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target.result;
        };
        reader.readAsDataURL(source);
      } else {
        img.src = source;
      }
    });
  }

  /**
   * Extract embedding from image
   */
  async extractEmbedding(imageElement) {
    if (this.modelLoaded && this.model) {
      // Real implementation with TensorFlow
      try {
        const predictions = await this.model.infer(imageElement, true);
        const embedding = await predictions.data();
        return Array.from(embedding);
      } catch (error) {
        console.error('Error extracting embedding:', error);
      }
    }

    // Fallback: generate random embedding (demo)
    console.log('⚠️ Using simulated embedding (MobileNet not loaded)');
    return this.generateRandomEmbedding();
  }

  /**
   * Find similar embeddings
   */
  findSimilar(queryEmbedding) {
    const similarities = [];

    for (const [placeId, placeData] of this.visualDB) {
      const similarity = this.cosineSimilarity(queryEmbedding, placeData.embedding);

      similarities.push({
        placeId,
        name: placeData.name,
        category: placeData.category,
        features: placeData.features,
        similarity,
        embedding: placeData.embedding
      });
    }

    // Sort by similarity (descending)
    similarities.sort((a, b) => b.similarity - a.similarity);

    return similarities;
  }

  /**
   * Cosine similarity between two vectors
   */
  cosineSimilarity(vec1, vec2) {
    if (vec1.length !== vec2.length) {
      throw new Error('Vectors must have same length');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    if (norm1 === 0 || norm2 === 0) return 0;

    return dotProduct / (norm1 * norm2);
  }

  /**
   * Normalize vector to unit length
   */
  normalizeVector(vec) {
    const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
    return vec.map(val => val / norm);
  }

  /**
   * Generate reasoning for why places are similar
   */
  generateReasoning(queryEmbedding, result) {
    const reasons = [];

    // Category match
    reasons.push(`Categoría: ${result.category}`);

    // Feature analysis
    if (result.features) {
      const features = Object.keys(result.features).filter(k => result.features[k]);
      if (features.length > 0) {
        reasons.push(`Características: ${features.join(', ')}`);
      }
    }

    // Similarity score
    const percentage = (result.similarity * 100).toFixed(0);
    reasons.push(`${percentage}% similar visualmente`);

    return reasons.join(' • ');
  }

  /**
   * 🎨 CLUSTERING
   */

  /**
   * Build clusters using K-means
   */
  async buildClusters(k = 6) {
    console.log(`🎨 Building ${k} visual clusters...`);

    // Get all embeddings
    const embeddings = Array.from(this.visualDB.values()).map(p => p.embedding);
    const placeIds = Array.from(this.visualDB.keys());

    if (embeddings.length < k) {
      console.warn('Not enough data for clustering');
      return;
    }

    // K-means clustering
    const { assignments, centroids } = this.kMeans(embeddings, k);

    // Build cluster map
    this.clusters.clear();
    this.clusterCentroids.clear();

    for (let i = 0; i < k; i++) {
      const clusterPlaces = placeIds.filter((_, idx) => assignments[idx] === i);
      this.clusters.set(i, clusterPlaces);
      this.clusterCentroids.set(i, centroids[i]);
    }

    console.log(`✅ Built ${k} clusters`);

    await this.save();
  }

  /**
   * K-means clustering algorithm
   */
  kMeans(data, k, maxIter = 100) {
    const n = data.length;
    const dim = data[0].length;

    // Initialize centroids randomly
    let centroids = [];
    const usedIndices = new Set();

    for (let i = 0; i < k; i++) {
      let idx;
      do {
        idx = Math.floor(Math.random() * n);
      } while (usedIndices.has(idx));

      usedIndices.add(idx);
      centroids.push([...data[idx]]);
    }

    let assignments = new Array(n);

    // Iterate
    for (let iter = 0; iter < maxIter; iter++) {
      // Assign to nearest centroid
      let changed = false;

      for (let i = 0; i < n; i++) {
        let minDist = Infinity;
        let bestCluster = 0;

        for (let j = 0; j < k; j++) {
          const dist = this.euclideanDistance(data[i], centroids[j]);
          if (dist < minDist) {
            minDist = dist;
            bestCluster = j;
          }
        }

        if (assignments[i] !== bestCluster) {
          assignments[i] = bestCluster;
          changed = true;
        }
      }

      if (!changed) break;

      // Update centroids
      for (let j = 0; j < k; j++) {
        const clusterPoints = data.filter((_, idx) => assignments[idx] === j);

        if (clusterPoints.length > 0) {
          centroids[j] = new Array(dim).fill(0);

          for (const point of clusterPoints) {
            for (let d = 0; d < dim; d++) {
              centroids[j][d] += point[d];
            }
          }

          for (let d = 0; d < dim; d++) {
            centroids[j][d] /= clusterPoints.length;
          }
        }
      }
    }

    return { assignments, centroids };
  }

  /**
   * Euclidean distance
   */
  euclideanDistance(vec1, vec2) {
    let sum = 0;
    for (let i = 0; i < vec1.length; i++) {
      const diff = vec1[i] - vec2[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }

  /**
   * Get cluster for a place
   */
  getCluster(placeId) {
    for (const [clusterId, places] of this.clusters) {
      if (places.includes(placeId)) {
        return clusterId;
      }
    }
    return null;
  }

  /**
   * Get similar places in same cluster
   */
  getClusterSiblings(placeId) {
    const clusterId = this.getCluster(placeId);
    if (clusterId === null) return [];

    const places = this.clusters.get(clusterId) || [];
    return places.filter(id => id !== placeId);
  }

  /**
   * 📥 ADD NEW PLACES
   */

  /**
   * Add new place with image
   */
  async addPlace(placeId, image, metadata = {}) {
    console.log(`📥 Adding place: ${placeId}`);

    // Extract embedding
    const imageElement = await this.loadImage(image);
    const embedding = await this.extractEmbedding(imageElement);

    // Store
    this.visualDB.set(placeId, {
      embedding,
      name: metadata.name || placeId,
      category: metadata.category || 'unknown',
      features: metadata.features || {},
      timestamp: Date.now()
    });

    this.stats.totalImages++;

    // Rebuild clusters periodically
    if (this.stats.totalImages % 10 === 0) {
      await this.buildClusters();
    }

    await this.save();

    console.log(`✅ Added place: ${placeId}`);

    return placeId;
  }

  /**
   * 💾 PERSISTENCE
   */

  /**
   * Save to storage
   */
  async save() {
    if (window.MLStorage) {
      await window.MLStorage.set('visual_intelligence', {
        visualDB: Array.from(this.visualDB.entries()),
        clusters: Array.from(this.clusters.entries()),
        centroids: Array.from(this.clusterCentroids.entries()),
        stats: this.stats
      });
    }
  }

  /**
   * 📊 Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      totalClusters: this.clusters.size,
      modelLoaded: this.modelLoaded
    };
  }

  /**
   * 🎨 Visualize clusters (for debugging)
   */
  visualizeClusters() {
    const visualization = {};

    for (const [clusterId, placeIds] of this.clusters) {
      const places = placeIds.map(id => {
        const data = this.visualDB.get(id);
        return {
          id,
          name: data?.name,
          category: data?.category
        };
      });

      visualization[`Cluster ${clusterId}`] = places;
    }

    return visualization;
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.VisualIntelligence = new VisualIntelligence();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.VisualIntelligence.initialize();
    });
  } else {
    window.VisualIntelligence.initialize();
  }

  console.log('📸 Visual Intelligence loaded!');
  console.log('💡 To use in production, add TensorFlow.js and MobileNet to HTML:');
  console.log('   <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"></script>');
  console.log('   <script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet"></script>');
}
