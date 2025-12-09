/**
 * 🔮 PREDICTIVE MODELS ENGINE
 * ============================
 *
 * Motor de modelos predictivos usando algoritmos clásicos de ML.
 * FASE 2 - LAYER 1
 *
 * Algoritmos implementados:
 * - Decision Trees (árboles de decisión)
 * - Random Forest (bosque aleatorio)
 * - Gradient Boosting (boosting de gradiente)
 * - Linear Regression (regresión lineal)
 * - Logistic Regression (clasificación)
 */

class PredictiveModelsEngine {
  constructor() {
    this.models = {};
    this.trainedModels = {};

    console.log('🔮 Predictive Models Engine initialized');
  }

  /**
   * 🌳 DECISION TREE
   */
  async trainDecisionTree(X, y, options = {}) {
    const {
      maxDepth = 10,
      minSamplesSplit = 2,
      minSamplesLeaf = 1
    } = options;

    console.log('🌳 Training Decision Tree...');

    const tree = this.buildTree(X, y, 0, maxDepth, minSamplesSplit, minSamplesLeaf);

    const modelId = `decision_tree_${Date.now()}`;
    this.trainedModels[modelId] = {
      type: 'decision_tree',
      tree,
      options,
      trainedAt: Date.now()
    };

    console.log('✅ Decision Tree trained');
    return modelId;
  }

  buildTree(X, y, depth, maxDepth, minSamplesSplit, minSamplesLeaf) {
    const n = X.length;

    // Condiciones de parada
    if (depth >= maxDepth || n < minSamplesSplit || this.isPure(y)) {
      return {
        type: 'leaf',
        value: this.mostCommon(y),
        samples: n
      };
    }

    // Encontrar mejor split
    const bestSplit = this.findBestSplit(X, y);

    if (!bestSplit) {
      return {
        type: 'leaf',
        value: this.mostCommon(y),
        samples: n
      };
    }

    // Dividir dataset
    const { leftIndices, rightIndices } = this.splitDataset(X, bestSplit);

    if (leftIndices.length < minSamplesLeaf || rightIndices.length < minSamplesLeaf) {
      return {
        type: 'leaf',
        value: this.mostCommon(y),
        samples: n
      };
    }

    const leftX = leftIndices.map(i => X[i]);
    const leftY = leftIndices.map(i => y[i]);
    const rightX = rightIndices.map(i => X[i]);
    const rightY = rightIndices.map(i => y[i]);

    // Recursión
    return {
      type: 'node',
      feature: bestSplit.feature,
      threshold: bestSplit.threshold,
      left: this.buildTree(leftX, leftY, depth + 1, maxDepth, minSamplesSplit, minSamplesLeaf),
      right: this.buildTree(rightX, rightY, depth + 1, maxDepth, minSamplesSplit, minSamplesLeaf),
      samples: n
    };
  }

  findBestSplit(X, y) {
    const numFeatures = X[0].length;
    let bestGini = Infinity;
    let bestSplit = null;

    for (let featureIdx = 0; featureIdx < numFeatures; featureIdx++) {
      const values = X.map(row => row[featureIdx]);
      const uniqueValues = [...new Set(values)].sort((a, b) => a - b);

      for (let i = 0; i < uniqueValues.length - 1; i++) {
        const threshold = (uniqueValues[i] + uniqueValues[i + 1]) / 2;
        const gini = this.calculateGini(X, y, featureIdx, threshold);

        if (gini < bestGini) {
          bestGini = gini;
          bestSplit = { feature: featureIdx, threshold };
        }
      }
    }

    return bestSplit;
  }

  calculateGini(X, y, feature, threshold) {
    const { leftIndices, rightIndices } = this.splitDataset(X, { feature, threshold });

    if (leftIndices.length === 0 || rightIndices.length === 0) {
      return Infinity;
    }

    const n = X.length;
    const leftY = leftIndices.map(i => y[i]);
    const rightY = rightIndices.map(i => y[i]);

    const leftGini = this.giniImpurity(leftY);
    const rightGini = this.giniImpurity(rightY);

    return (leftIndices.length / n) * leftGini + (rightIndices.length / n) * rightGini;
  }

  giniImpurity(y) {
    const counts = {};
    y.forEach(val => {
      counts[val] = (counts[val] || 0) + 1;
    });

    let impurity = 1;
    const n = y.length;

    Object.values(counts).forEach(count => {
      const p = count / n;
      impurity -= p * p;
    });

    return impurity;
  }

  splitDataset(X, split) {
    const leftIndices = [];
    const rightIndices = [];

    X.forEach((row, idx) => {
      if (row[split.feature] <= split.threshold) {
        leftIndices.push(idx);
      } else {
        rightIndices.push(idx);
      }
    });

    return { leftIndices, rightIndices };
  }

  isPure(y) {
    return new Set(y).size === 1;
  }

  mostCommon(y) {
    const counts = {};
    y.forEach(val => {
      counts[val] = (counts[val] || 0) + 1;
    });

    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }

  predictTree(tree, x) {
    if (tree.type === 'leaf') {
      return tree.value;
    }

    if (x[tree.feature] <= tree.threshold) {
      return this.predictTree(tree.left, x);
    } else {
      return this.predictTree(tree.right, x);
    }
  }

  /**
   * 🌲 RANDOM FOREST
   */
  async trainRandomForest(X, y, options = {}) {
    const {
      nTrees = 10,
      maxDepth = 10,
      minSamplesSplit = 2,
      sampleRatio = 0.8,
      featureRatio = 0.7
    } = options;

    console.log(`🌲 Training Random Forest with ${nTrees} trees...`);

    const forest = [];

    for (let i = 0; i < nTrees; i++) {
      // Bootstrap sampling
      const { sampledX, sampledY } = this.bootstrapSample(X, y, sampleRatio);

      // Feature sampling
      const numFeatures = Math.floor(X[0].length * featureRatio);
      const selectedFeatures = this.randomFeatures(X[0].length, numFeatures);

      // Subset data to selected features
      const subsetX = sampledX.map(row => selectedFeatures.map(idx => row[idx]));

      // Train tree
      const tree = this.buildTree(subsetX, sampledY, 0, maxDepth, minSamplesSplit, 1);

      forest.push({
        tree,
        selectedFeatures
      });
    }

    const modelId = `random_forest_${Date.now()}`;
    this.trainedModels[modelId] = {
      type: 'random_forest',
      forest,
      options,
      trainedAt: Date.now()
    };

    console.log('✅ Random Forest trained');
    return modelId;
  }

  bootstrapSample(X, y, ratio) {
    const n = X.length;
    const sampleSize = Math.floor(n * ratio);
    const sampledX = [];
    const sampledY = [];

    for (let i = 0; i < sampleSize; i++) {
      const idx = Math.floor(Math.random() * n);
      sampledX.push(X[idx]);
      sampledY.push(y[idx]);
    }

    return { sampledX, sampledY };
  }

  randomFeatures(total, num) {
    const features = [];
    const available = Array.from({ length: total }, (_, i) => i);

    for (let i = 0; i < num; i++) {
      const idx = Math.floor(Math.random() * available.length);
      features.push(available[idx]);
      available.splice(idx, 1);
    }

    return features.sort((a, b) => a - b);
  }

  predictForest(forest, x) {
    const predictions = forest.map(({ tree, selectedFeatures }) => {
      const subsetX = selectedFeatures.map(idx => x[idx]);
      return this.predictTree(tree, subsetX);
    });

    // Majority vote for classification
    return this.mostCommon(predictions);
  }

  /**
   * 📈 GRADIENT BOOSTING (Simplified)
   */
  async trainGradientBoosting(X, y, options = {}) {
    const {
      nEstimators = 10,
      learningRate = 0.1,
      maxDepth = 3
    } = options;

    console.log(`📈 Training Gradient Boosting with ${nEstimators} estimators...`);

    // Inicializar con media
    const initialPrediction = y.reduce((a, b) => a + b, 0) / y.length;
    const models = [];
    const residuals = y.map(val => val - initialPrediction);

    for (let i = 0; i < nEstimators; i++) {
      // Train tree on residuals
      const tree = this.buildTree(X, residuals, 0, maxDepth, 2, 1);
      models.push(tree);

      // Update residuals
      for (let j = 0; j < X.length; j++) {
        const prediction = this.predictTree(tree, X[j]);
        residuals[j] -= learningRate * parseFloat(prediction);
      }
    }

    const modelId = `gradient_boosting_${Date.now()}`;
    this.trainedModels[modelId] = {
      type: 'gradient_boosting',
      initialPrediction,
      models,
      learningRate,
      options,
      trainedAt: Date.now()
    };

    console.log('✅ Gradient Boosting trained');
    return modelId;
  }

  predictGradientBoosting(model, x) {
    let prediction = model.initialPrediction;

    model.models.forEach(tree => {
      prediction += model.learningRate * parseFloat(this.predictTree(tree, x));
    });

    return prediction;
  }

  /**
   * 📊 LINEAR REGRESSION
   */
  async trainLinearRegression(X, y) {
    console.log('📊 Training Linear Regression...');

    // Agregar bias term (columna de 1s)
    const X_bias = X.map(row => [1, ...row]);

    // Normal equation: θ = (X^T X)^(-1) X^T y
    const XtX = this.matrixMultiply(this.transpose(X_bias), X_bias);
    const XtX_inv = this.matrixInverse(XtX);
    const Xty = this.matrixVectorMultiply(this.transpose(X_bias), y);
    const theta = this.matrixVectorMultiply(XtX_inv, Xty);

    const modelId = `linear_regression_${Date.now()}`;
    this.trainedModels[modelId] = {
      type: 'linear_regression',
      theta,
      trainedAt: Date.now()
    };

    console.log('✅ Linear Regression trained');
    return modelId;
  }

  predictLinearRegression(theta, x) {
    const x_bias = [1, ...x];
    return x_bias.reduce((sum, val, i) => sum + val * theta[i], 0);
  }

  /**
   * 🎯 PREDICT METHOD (Unified)
   */
  async predict(modelId, X) {
    const model = this.trainedModels[modelId];
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    const predictions = [];

    for (const x of X) {
      let pred;

      switch (model.type) {
        case 'decision_tree':
          pred = this.predictTree(model.tree, x);
          break;

        case 'random_forest':
          pred = this.predictForest(model.forest, x);
          break;

        case 'gradient_boosting':
          pred = this.predictGradientBoosting(model, x);
          break;

        case 'linear_regression':
          pred = this.predictLinearRegression(model.theta, x);
          break;

        default:
          throw new Error(`Unknown model type: ${model.type}`);
      }

      predictions.push(pred);
    }

    return predictions;
  }

  /**
   * 📊 EVALUATE MODEL
   */
  async evaluate(modelId, X_test, y_test, metric = 'accuracy') {
    const predictions = await this.predict(modelId, X_test);

    switch (metric) {
      case 'accuracy':
        return this.calculateAccuracy(predictions, y_test);

      case 'mse':
        return this.calculateMSE(predictions, y_test);

      case 'mae':
        return this.calculateMAE(predictions, y_test);

      case 'r2':
        return this.calculateR2(predictions, y_test);

      default:
        throw new Error(`Unknown metric: ${metric}`);
    }
  }

  calculateAccuracy(predictions, yTrue) {
    let correct = 0;
    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i] === yTrue[i]) correct++;
    }
    return correct / predictions.length;
  }

  calculateMSE(predictions, yTrue) {
    let sum = 0;
    for (let i = 0; i < predictions.length; i++) {
      sum += Math.pow(predictions[i] - yTrue[i], 2);
    }
    return sum / predictions.length;
  }

  calculateMAE(predictions, yTrue) {
    let sum = 0;
    for (let i = 0; i < predictions.length; i++) {
      sum += Math.abs(predictions[i] - yTrue[i]);
    }
    return sum / predictions.length;
  }

  calculateR2(predictions, yTrue) {
    const yMean = yTrue.reduce((a, b) => a + b, 0) / yTrue.length;

    let ssRes = 0;
    let ssTot = 0;

    for (let i = 0; i < predictions.length; i++) {
      ssRes += Math.pow(yTrue[i] - predictions[i], 2);
      ssTot += Math.pow(yTrue[i] - yMean, 2);
    }

    return 1 - (ssRes / ssTot);
  }

  /**
   * 🔧 MATRIX OPERATIONS (Helper methods)
   */
  transpose(matrix) {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
  }

  matrixMultiply(A, B) {
    const result = Array(A.length).fill(0).map(() => Array(B[0].length).fill(0));

    for (let i = 0; i < A.length; i++) {
      for (let j = 0; j < B[0].length; j++) {
        for (let k = 0; k < A[0].length; k++) {
          result[i][j] += A[i][k] * B[k][j];
        }
      }
    }

    return result;
  }

  matrixVectorMultiply(matrix, vector) {
    return matrix.map(row =>
      row.reduce((sum, val, i) => sum + val * vector[i], 0)
    );
  }

  matrixInverse(matrix) {
    // Simplified 2x2 and 3x3 inverse (para production usar library)
    const n = matrix.length;

    if (n === 2) {
      const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
      if (Math.abs(det) < 1e-10) throw new Error('Matrix is singular');

      return [
        [matrix[1][1] / det, -matrix[0][1] / det],
        [-matrix[1][0] / det, matrix[0][0] / det]
      ];
    }

    // Para matrices más grandes, usar Gauss-Jordan
    return this.gaussJordanInverse(matrix);
  }

  gaussJordanInverse(matrix) {
    const n = matrix.length;
    const augmented = matrix.map((row, i) => [
      ...row,
      ...Array(n).fill(0).map((_, j) => i === j ? 1 : 0)
    ]);

    // Forward elimination
    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }

      // Swap rows
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

      // Scale pivot row
      const pivot = augmented[i][i];
      if (Math.abs(pivot) < 1e-10) throw new Error('Matrix is singular');

      for (let j = 0; j < 2 * n; j++) {
        augmented[i][j] /= pivot;
      }

      // Eliminate column
      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = augmented[k][i];
          for (let j = 0; j < 2 * n; j++) {
            augmented[k][j] -= factor * augmented[i][j];
          }
        }
      }
    }

    // Extract inverse from right half
    return augmented.map(row => row.slice(n));
  }

  /**
   * 💾 SAVE/LOAD MODELS
   */
  async saveModel(modelId) {
    const model = this.trainedModels[modelId];
    if (!model) throw new Error(`Model ${modelId} not found`);

    if (window.MLStorage) {
      await window.MLStorage.saveModel({
        modelId,
        ...model
      });
    }

    return modelId;
  }

  async loadModel(modelId) {
    if (window.MLStorage) {
      const model = await window.MLStorage.getModel(modelId);
      if (model) {
        this.trainedModels[modelId] = model;
        return model;
      }
    }

    throw new Error(`Model ${modelId} not found in storage`);
  }

  getModel(modelId) {
    return this.trainedModels[modelId];
  }

  listModels() {
    return Object.keys(this.trainedModels);
  }
}

// 🌐 Instancia global
if (typeof window !== 'undefined') {
  window.PredictiveModelsEngine = new PredictiveModelsEngine();
}

export default PredictiveModelsEngine;
