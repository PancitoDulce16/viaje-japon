/**
 * 🧪 ML TEST PANEL - Panel de Pruebas del ML Brain
 * =================================================
 *
 * Interfaz interactiva para probar todos los módulos ML FASE 1, 2 y 3
 */

class MLTestPanel {
  constructor() {
    this.panelOpen = false;
    this.testResults = [];

    console.log('🧪 ML Test Panel initialized');
  }

  /**
   * 🎨 Crear UI del panel
   */
  createPanel() {
    const panel = document.createElement('div');
    panel.id = 'ml-test-panel';
    panel.innerHTML = `
      <div class="ml-panel-header">
        <h2>🧠 ML Brain Test Panel</h2>
        <button id="ml-panel-close">✕</button>
      </div>

      <div class="ml-panel-content">
        <!-- FASE 1: Foundations -->
        <div class="ml-section">
          <h3>📡 FASE 1: Foundations</h3>
          <button class="ml-test-btn" data-test="test-sensor">🔍 Test Sensor Layer</button>
          <button class="ml-test-btn" data-test="test-patterns">🎯 Test Pattern Recognition</button>
          <button class="ml-test-btn" data-test="test-features">🎨 Test Feature Engineering</button>
          <button class="ml-test-btn" data-test="test-storage">💾 Test ML Storage</button>
        </div>

        <!-- FASE 2: Prediction -->
        <div class="ml-section">
          <h3>🔮 FASE 2: Prediction</h3>
          <button class="ml-test-btn" data-test="test-decision-tree">🌲 Test Decision Tree</button>
          <button class="ml-test-btn" data-test="test-timeseries">📈 Test Time Series</button>
          <button class="ml-test-btn" data-test="test-fatigue">😴 Test Fatigue Predictor</button>
          <button class="ml-test-btn" data-test="test-anomaly">🚨 Test Anomaly Detector</button>
          <button class="ml-test-btn" data-test="test-uncertainty">🎲 Test Uncertainty</button>
        </div>

        <!-- FASE 3: Collaboration -->
        <div class="ml-section">
          <h3>🤝 FASE 3: Collaboration</h3>
          <button class="ml-test-btn" data-test="test-knowledge-graph">🕸️ Test Knowledge Graph</button>
          <button class="ml-test-btn" data-test="test-collaborative">🤝 Test Collaborative Filtering</button>
          <button class="ml-test-btn" data-test="test-swarm">🐝 Test Swarm Intelligence</button>
        </div>

        <!-- Demo Completo -->
        <div class="ml-section">
          <h3>🎯 Demo Completo</h3>
          <button class="ml-test-btn ml-test-btn-primary" data-test="run-full-demo">🚀 Run Full ML Demo</button>
        </div>

        <!-- Results Area -->
        <div class="ml-results">
          <h4>📊 Test Results:</h4>
          <div id="ml-test-output"></div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);
    this.attachEventListeners();
    this.addStyles();
  }

  attachEventListeners() {
    // Close button
    document.getElementById('ml-panel-close').addEventListener('click', () => {
      this.closePanel();
    });

    // Test buttons
    document.querySelectorAll('.ml-test-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const test = e.target.dataset.test;
        await this.runTest(test);
      });
    });
  }

  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #ml-test-panel {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        z-index: 10000;
        width: 90%;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        animation: slideIn 0.3s ease-out;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translate(-50%, -40%);
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%);
        }
      }

      .ml-panel-header {
        background: rgba(255,255,255,0.1);
        padding: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid rgba(255,255,255,0.2);
      }

      .ml-panel-header h2 {
        margin: 0;
        color: white;
        font-size: 24px;
      }

      #ml-panel-close {
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        font-size: 24px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s;
      }

      #ml-panel-close:hover {
        background: rgba(255,255,255,0.3);
        transform: rotate(90deg);
      }

      .ml-panel-content {
        padding: 20px;
      }

      .ml-section {
        background: rgba(255,255,255,0.1);
        border-radius: 15px;
        padding: 20px;
        margin-bottom: 20px;
      }

      .ml-section h3 {
        color: white;
        margin-top: 0;
        margin-bottom: 15px;
        font-size: 18px;
      }

      .ml-test-btn {
        background: rgba(255,255,255,0.2);
        border: 2px solid rgba(255,255,255,0.3);
        color: white;
        padding: 12px 20px;
        margin: 5px;
        border-radius: 10px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s;
        font-weight: 600;
      }

      .ml-test-btn:hover {
        background: rgba(255,255,255,0.3);
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      }

      .ml-test-btn:active {
        transform: translateY(0);
      }

      .ml-test-btn-primary {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        border: none;
        font-size: 16px;
        padding: 15px 30px;
      }

      .ml-results {
        background: rgba(0,0,0,0.3);
        border-radius: 15px;
        padding: 20px;
        margin-top: 20px;
      }

      .ml-results h4 {
        color: white;
        margin-top: 0;
      }

      #ml-test-output {
        background: rgba(0,0,0,0.2);
        border-radius: 10px;
        padding: 15px;
        min-height: 100px;
        max-height: 300px;
        overflow-y: auto;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        color: #00ff00;
      }

      .test-result {
        margin-bottom: 10px;
        padding: 10px;
        border-radius: 5px;
        background: rgba(255,255,255,0.05);
      }

      .test-result.success {
        border-left: 4px solid #00ff00;
      }

      .test-result.error {
        border-left: 4px solid #ff0000;
        color: #ff6b6b;
      }

      .test-result.info {
        border-left: 4px solid #00bfff;
        color: #00bfff;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 🧪 Run specific test
   */
  async runTest(testName) {
    this.log(`Running test: ${testName}...`, 'info');

    try {
      switch(testName) {
        // FASE 1 Tests
        case 'test-sensor':
          await this.testSensorLayer();
          break;
        case 'test-patterns':
          await this.testPatternRecognition();
          break;
        case 'test-features':
          await this.testFeatureEngineering();
          break;
        case 'test-storage':
          await this.testMLStorage();
          break;

        // FASE 2 Tests
        case 'test-decision-tree':
          await this.testDecisionTree();
          break;
        case 'test-timeseries':
          await this.testTimeSeries();
          break;
        case 'test-fatigue':
          await this.testFatiguePredictor();
          break;
        case 'test-anomaly':
          await this.testAnomalyDetector();
          break;
        case 'test-uncertainty':
          await this.testUncertaintyEstimator();
          break;

        // FASE 3 Tests
        case 'test-knowledge-graph':
          await this.testKnowledgeGraph();
          break;
        case 'test-collaborative':
          await this.testCollaborativeFiltering();
          break;
        case 'test-swarm':
          await this.testSwarmIntelligence();
          break;

        // Full Demo
        case 'run-full-demo':
          await this.runFullDemo();
          break;
      }
    } catch (error) {
      this.log(`❌ Test failed: ${error.message}`, 'error');
      console.error(error);
    }
  }

  // ============================================
  // FASE 1 TESTS
  // ============================================

  async testSensorLayer() {
    this.log('🔍 Testing Sensor Layer...', 'info');

    try {
      const summary = window.SensorLayer?.getSessionSummary() || {};

      // Verificar que behavioral existe
      if (summary.behavioral) {
        this.log(`✅ Session clicks: ${summary.behavioral.clicks?.length || 0}`, 'success');
        this.log(`✅ Engagement score: ${summary.behavioral.engagementScore || 0}`, 'success');
      } else {
        this.log('⚠️ No behavioral data available yet', 'warning');
      }

      this.log(`✅ Session duration: ${((summary.duration || 0) / 1000).toFixed(0)}s`, 'success');
    } catch (error) {
      this.log(`❌ Error testing Sensor Layer: ${error.message}`, 'error');
    }
  }

  async testPatternRecognition() {
    this.log('🎯 Testing Pattern Recognition...', 'info');

    const userData = {
      behavioral: window.SensorLayer.getBehavioralPatterns()
    };

    const archetype = window.PatternRecognitionEngine.classifyUser(userData);
    this.log(`✅ User archetype: ${archetype.primary.name}`, 'success');
    this.log(`✅ Confidence: ${(archetype.primary.score * 100).toFixed(0)}%`, 'success');
  }

  async testFeatureEngineering() {
    this.log('🎨 Testing Feature Engineering...', 'info');

    const userData = {
      behavioral: window.SensorLayer.getBehavioralPatterns()
    };

    const features = window.FeatureEngineering.createAdvancedFeatures(userData);
    const vector = window.FeatureEngineering.flattenToVector(features);

    this.log(`✅ Generated ${vector.featureNames.length} features`, 'success');
    this.log(`✅ Sample features: ${vector.featureNames.slice(0, 5).join(', ')}...`, 'success');
  }

  async testMLStorage() {
    this.log('💾 Testing ML Storage...', 'info');

    const stats = await window.MLStorage.getStatistics();
    this.log(`✅ Total sessions: ${stats.sessions}`, 'success');
    this.log(`✅ Total patterns: ${stats.patterns}`, 'success');
    this.log(`✅ Storage initialized: ${window.MLStorage.initialized}`, 'success');
  }

  // ============================================
  // FASE 2 TESTS
  // ============================================

  async testDecisionTree() {
    this.log('🌲 Testing Decision Tree...', 'info');

    // Sample training data
    const X = [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6]];
    const y = [0, 0, 1, 1, 1];

    const modelId = await window.PredictiveModelsEngine.trainDecisionTree(X, y, { maxDepth: 3 });
    this.log(`✅ Model trained: ${modelId}`, 'success');

    const prediction = await window.PredictiveModelsEngine.predict(modelId, [[3, 3.5]]);
    this.log(`✅ Prediction for [3, 3.5]: ${prediction[0]}`, 'success');
  }

  async testTimeSeries() {
    this.log('📈 Testing Time Series Forecaster...', 'info');

    const timeSeries = [10, 12, 15, 14, 18, 20, 22, 25];
    const forecast = window.TimeSeriesForecaster.simpleExponentialSmoothing(timeSeries, 0.3, 3);

    this.log(`✅ Original series length: ${timeSeries.length}`, 'success');
    this.log(`✅ Forecast next 3 steps: ${forecast.forecast.map(v => v.toFixed(1)).join(', ')}`, 'success');
    this.log(`✅ Last smoothed value: ${forecast.lastSmoothed.toFixed(2)}`, 'success');
  }

  async testFatiguePredictor() {
    this.log('😴 Testing Fatigue Predictor...', 'info');

    const tripData = {
      days: 7,
      itinerary: [
        { day: 1, type: 'temple', duration: 120, intensity: 'moderate' },
        { day: 1, type: 'shopping', duration: 180, intensity: 'low' },
        { day: 2, type: 'hiking', duration: 240, intensity: 'high' }
      ],
      origin: 'New York',
      destination: 'Tokyo'
    };

    const prediction = await window.FatiguePredictor.predictTripFatigue(tripData);
    this.log(`✅ Peak fatigue: ${prediction.summary.peakFatigue} on day ${prediction.summary.peakDay}`, 'success');
    this.log(`✅ Average fatigue: ${prediction.summary.averageFatigue.toFixed(0)}`, 'success');
    this.log(`✅ Warnings: ${prediction.warnings.length}`, prediction.warnings.length > 0 ? 'error' : 'success');
  }

  async testAnomalyDetector() {
    this.log('🚨 Testing Anomaly Detector...', 'info');

    const userData = {
      sessionData: window.SensorLayer.getSessionSummary(),
      behavior: {
        budget: 150000,
        activities: [{ day: 1 }, { day: 1 }, { day: 1 }]
      },
      context: {
        userState: {}
      }
    };

    const scan = await window.AnomalyDetector.comprehensiveScan(userData);
    this.log(`✅ Anomalies detected: ${scan.summary.totalAnomalies}`, 'success');
    this.log(`✅ Overall risk: ${scan.summary.overallRisk}`, 'info');

    if (scan.anomalies.length > 0) {
      this.log(`⚠️ Sample anomaly: ${scan.anomalies[0].reason}`, 'error');
    }
  }

  async testUncertaintyEstimator() {
    this.log('🎲 Testing Uncertainty Estimator...', 'info');

    const prediction = 75; // Fatigue prediction
    const context = {
      historicalDataPoints: 15,
      requiredMinimum: 10,
      complexity: 'moderate',
      predictionType: 'behavior'
    };

    const uncertainty = window.UncertaintyEstimator.estimatePredictionUncertainty(prediction, context);
    this.log(`✅ Confidence: ${(uncertainty.confidence * 100).toFixed(1)}%`, 'success');
    this.log(`✅ Uncertainty: ${(uncertainty.uncertainty * 100).toFixed(1)}%`, 'info');
    this.log(`✅ Level: ${uncertainty.level}`, 'info');
    this.log(`✅ Recommendation: ${uncertainty.recommendation}`, 'info');
  }

  // ============================================
  // FASE 3 TESTS
  // ============================================

  async testKnowledgeGraph() {
    this.log('🕸️ Testing Knowledge Graph...', 'info');

    const stats = window.KnowledgeGraph.getStatistics();
    this.log(`✅ Total nodes: ${stats.totalNodes}`, 'success');
    this.log(`✅ Total edges: ${stats.totalEdges}`, 'success');
    this.log(`✅ Average degree: ${stats.avgDegree.toFixed(2)}`, 'info');

    // Search test
    const results = window.KnowledgeGraph.semanticSearch('temple', 3);
    this.log(`✅ Search "temple" found ${results.length} results`, 'success');

    // Path finding
    const path = window.KnowledgeGraph.findPath('fushimi_inari', 'kyoto');
    if (path) {
      this.log(`✅ Path found: ${path.length} steps`, 'success');
    }
  }

  async testCollaborativeFiltering() {
    this.log('🤝 Testing Collaborative Filtering...', 'info');

    // Add sample interactions
    window.CollaborativeFiltering.addInteraction('user1', 'temple_1', 5.0);
    window.CollaborativeFiltering.addInteraction('user1', 'food_1', 4.5);
    window.CollaborativeFiltering.addInteraction('user2', 'temple_1', 4.8);
    window.CollaborativeFiltering.addInteraction('user2', 'temple_2', 5.0);

    const popular = window.CollaborativeFiltering.getPopularItems(3);
    this.log(`✅ Popular items: ${popular.length}`, 'success');

    if (popular.length > 0) {
      this.log(`✅ Top item score: ${popular[0].popularityScore.toFixed(2)}`, 'info');
    }
  }

  async testSwarmIntelligence() {
    this.log('🐝 Testing Swarm Intelligence...', 'info');

    // Simple optimization: find minimum of (x-5)^2
    const objectiveFunction = (position) => {
      const x = position[0];
      return -(x - 5) * (x - 5); // Negative because PSO maximizes
    };

    const bounds = {
      min: [0],
      max: [10]
    };

    const result = await window.SwarmIntelligence.particleSwarmOptimization(
      objectiveFunction,
      bounds,
      { swarmSize: 10, maxIterations: 20 }
    );

    this.log(`✅ Best solution: ${result.bestSolution[0].toFixed(2)} (expected: ~5)`, 'success');
    this.log(`✅ Best fitness: ${result.bestFitness.toFixed(4)}`, 'info');
    this.log(`✅ Iterations: ${result.iterations}`, 'info');
  }

  // ============================================
  // FULL DEMO
  // ============================================

  async runFullDemo() {
    this.log('🚀 Running FULL ML DEMO...', 'info');
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');

    await this.delay(500);

    // FASE 1
    this.log('\n📡 FASE 1: FOUNDATIONS', 'info');
    await this.testSensorLayer();
    await this.delay(500);
    await this.testPatternRecognition();
    await this.delay(500);

    // FASE 2
    this.log('\n🔮 FASE 2: PREDICTION', 'info');
    await this.testTimeSeries();
    await this.delay(500);
    await this.testFatiguePredictor();
    await this.delay(500);
    await this.testUncertaintyEstimator();
    await this.delay(500);

    // FASE 3
    this.log('\n🤝 FASE 3: COLLABORATION', 'info');
    await this.testKnowledgeGraph();
    await this.delay(500);
    await this.testSwarmIntelligence();
    await this.delay(500);

    this.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'success');
    this.log('✅ FULL DEMO COMPLETE! All systems operational! 🎉', 'success');
  }

  // ============================================
  // UTILITIES
  // ============================================

  log(message, type = 'info') {
    const output = document.getElementById('ml-test-output');
    const result = document.createElement('div');
    result.className = `test-result ${type}`;
    result.textContent = message;
    output.appendChild(result);
    output.scrollTop = output.scrollHeight;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  openPanel() {
    if (this.panelOpen) return;
    this.createPanel();
    this.panelOpen = true;
  }

  closePanel() {
    const panel = document.getElementById('ml-test-panel');
    if (panel) {
      panel.remove();
      this.panelOpen = false;
    }
  }
}

// 🌐 Global instance
if (typeof window !== 'undefined') {
  window.MLTestPanel = new MLTestPanel();

  // Add keyboard shortcut: Ctrl+Shift+M
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'M') {
      window.MLTestPanel.openPanel();
    }
  });

  // Add button listener (when DOM is ready)
  document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('open-ml-test-panel');
    if (openBtn) {
      openBtn.addEventListener('click', () => {
        window.MLTestPanel.openPanel();
      });
    }
  });

  console.log('🧪 ML Test Panel ready! Press Ctrl+Shift+M or click the 🧠 button to open');
}
