/** Loads experimental AI modules outside the critical rendering path. */
let loadingPromise;
const batches = [
  [() => import('../ml/ml-storage.js'), () => import('../ml/sensor-layer.js'), () => import('../ml/pattern-recognition.js'), () => import('../ml/data-pipeline.js'), () => import('../ml/feature-engineering.js'), () => import('../ml/ml-brain.js')],
  [() => import('../ml/predictive-models.js'), () => import('../ml/time-series-forecaster.js'), () => import('../ml/fatigue-predictor.js'), () => import('../ml/anomaly-detector.js'), () => import('../ml/uncertainty-estimator.js'), () => import('../ml/knowledge-graph.js'), () => import('../ml/collaborative-filtering.js'), () => import('../ml/swarm-intelligence.js'), () => import('../ai/ml-itinerary-enhancer.js'), () => import('../ml/semantic-intent-recognition.js'), () => import('../ml/nlp-engine.js'), () => import('../ml/smart-response-generator.js'), () => import('../ml/ai-action-executor.js'), () => import('../ml/proactive-recommendations.js'), () => import('../ml/feedback-learning.js'), () => import('../ml/conversational-memory.js'), () => import('../ml/personality-adapter.js'), () => import('../ml/intent-chaining.js'), () => import('../ml/ai-insights.js')],
  [() => import('../ml/reinforcement-learning.js'), () => import('../ml/meta-learning.js'), () => import('../ml/transfer-learning.js'), () => import('../ml/few-shot-learning.js'), () => import('../ml/curriculum-learning.js'), () => import('../ml/learning-strategies.js'), () => import('../ml/self-improvement.js'), () => import('../ml/dialogue-manager.js'), () => import('../ml/conversational-ai.js'), () => import('../ml/reasoning-engine.js'), () => import('../ml/proactive-assistant.js'), () => import('../ml/tree-of-thoughts.js'), () => import('../ml/uncertainty-handler.js'), () => import('../ml/multi-agent-debate.js'), () => import('../ml/fallback-autonomy.js'), () => import('../ml/thought-optimizer.js'), () => import('../ml/long-term-memory.js'), () => import('../core/data-integration.js'), () => import('../ml/visual-intelligence.js'), () => import('../ml/swarm-intelligence-advanced.js'), () => import('../ml/autonomous-agent.js'), () => import('../ml/self-reflection.js'), () => import('../ml/auto-trainer.js'), () => import('../ml/explainable-ai.js'), () => import('../ml/active-learning.js'), () => import('../ml/ensemble-methods.js'), () => import('../ml/contextual-memory-networks.js'), () => import('../ml/adaptive-response-generation.js'), () => import('../ai/ai-chat-ui.js')],
  [() => import('../ai/preference-predictor.js'), () => import('../ai/expert-decision-engine.js'), () => import('../map/genetic-route-optimizer.js'), () => import('../ai/visual-pace-simulator.js'), () => import('../ai/ml-integration.js'), () => import('../features/itinerary/itinerary-anomaly-detector.js'), () => import('../ai/energy-burnout-predictor.js'), () => import('../ai/collaborative-recommender.js'), () => import('../ai/smart-description-generator.js'), () => import('../ai/nlp-command-parser.js'), () => import('../map/geo-optimizer.js'), () => import('../map/geo-optimizer-ui.js'), () => import('../features/budget/budget-intelligence.js'), () => import('../features/budget/budget-intelligence-ui.js'), () => import('../ai/traveler-profiles.js'), () => import('../ai/traveler-profiles-ui.js'), () => import('../features/planning/live-mode.js'), () => import('../features/planning/live-mode-ui.js'), () => import('../ai/ai-control-panel.js')]
];

export function loadAIStack() {
  if (!loadingPromise) loadingPromise = (async () => {
    for (const batch of batches) await Promise.allSettled(batch.map(load => load()));
    window.AIControlPanel?.render?.();
    window.dispatchEvent(new CustomEvent('japitin:ai-ready'));
    return true;
  })();
  return loadingPromise;
}

window.JapitinPerformance = { ...(window.JapitinPerformance || {}), loadAIStack };
window.addEventListener('japitin:load-ai', loadAIStack);
document.addEventListener('click', async (event) => {
  const trigger = event.target.closest('[onclick*="AIChatUI"], [data-load-ai]');
  if (!trigger || window.AIChatUI) return;
  event.preventDefault(); event.stopImmediatePropagation();
  await loadAIStack(); window.AIChatUI?.open?.();
}, true);
window.addEventListener('load', () => {
  const schedule = window.requestIdleCallback || ((callback) => setTimeout(callback, 4000));
  schedule(loadAIStack, { timeout: 12000 });
}, { once: true });
