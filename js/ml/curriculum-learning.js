/**
 * 📚 FASE 6: CURRICULUM LEARNING ENGINE
 * =======================================
 *
 * "Aprender Progresivamente (Fácil → Difícil)"
 *
 * Como una escuela: primero aprendes sumar, luego multiplicar, luego álgebra.
 * La AI aprende habilidades en orden de dificultad.
 *
 * Implementa:
 * - Skill Progression: Habilidades ordenadas por dificultad
 * - Mastery Tracking: Saber qué tan bien domina cada habilidad
 * - Adaptive Difficulty: Ajustar dificultad según progreso
 * - Prerequisite Management: Asegurar que domina básicos antes de avanzar
 *
 * Curriculum de Aprendizaje:
 * Nivel 1: Basic Recommendations (recomendar actividades simples)
 * Nivel 2: Context-Aware (considerar contexto del usuario)
 * Nivel 3: Multi-Turn Planning (planificar conversaciones largas)
 * Nivel 4: Complex Optimization (optimizar múltiples objetivos)
 * Nivel 5: Predictive Intelligence (anticipar necesidades)
 */

class CurriculumLearningEngine {
  constructor() {
    this.initialized = false;

    // Curriculum: ordered list of skills to learn
    this.curriculum = [
      {
        id: 'basic_recommendations',
        name: 'Recomendaciones Básicas',
        level: 1,
        description: 'Recomendar actividades basadas en categoría',
        prerequisites: [],
        requiredAccuracy: 0.7,
        examples: 10,
        difficulty: 'easy'
      },
      {
        id: 'sentiment_aware',
        name: 'Consciencia de Sentimiento',
        level: 2,
        description: 'Detectar y responder al sentimiento del usuario',
        prerequisites: ['basic_recommendations'],
        requiredAccuracy: 0.7,
        examples: 15,
        difficulty: 'easy'
      },
      {
        id: 'context_aware',
        name: 'Consciencia de Contexto',
        level: 3,
        description: 'Considerar contexto del viaje (presupuesto, días, preferencias)',
        prerequisites: ['sentiment_aware'],
        requiredAccuracy: 0.75,
        examples: 20,
        difficulty: 'medium'
      },
      {
        id: 'multi_turn_planning',
        name: 'Planificación Multi-Turno',
        level: 4,
        description: 'Mantener coherencia en conversaciones de 5+ turnos',
        prerequisites: ['context_aware'],
        requiredAccuracy: 0.75,
        examples: 25,
        difficulty: 'medium'
      },
      {
        id: 'pattern_recognition',
        name: 'Reconocimiento de Patrones',
        level: 5,
        description: 'Identificar patrones en comportamiento del usuario',
        prerequisites: ['multi_turn_planning'],
        requiredAccuracy: 0.8,
        examples: 30,
        difficulty: 'medium'
      },
      {
        id: 'complex_optimization',
        name: 'Optimización Compleja',
        level: 6,
        description: 'Optimizar múltiples objetivos simultáneamente (tiempo, dinero, fatiga)',
        prerequisites: ['pattern_recognition'],
        requiredAccuracy: 0.8,
        examples: 40,
        difficulty: 'hard'
      },
      {
        id: 'predictive_intelligence',
        name: 'Inteligencia Predictiva',
        level: 7,
        description: 'Anticipar necesidades antes de que usuario las pida',
        prerequisites: ['complex_optimization'],
        requiredAccuracy: 0.85,
        examples: 50,
        difficulty: 'hard'
      },
      {
        id: 'adaptive_learning',
        name: 'Aprendizaje Adaptativo',
        level: 8,
        description: 'Adaptar estrategia de aprendizaje según tipo de usuario',
        prerequisites: ['predictive_intelligence'],
        requiredAccuracy: 0.85,
        examples: 60,
        difficulty: 'hard'
      },
      {
        id: 'creative_problem_solving',
        name: 'Resolución Creativa',
        level: 9,
        description: 'Proponer soluciones creativas a problemas complejos',
        prerequisites: ['adaptive_learning'],
        requiredAccuracy: 0.9,
        examples: 75,
        difficulty: 'expert'
      },
      {
        id: 'autonomous_planning',
        name: 'Planificación Autónoma',
        level: 10,
        description: 'Crear itinerarios completos sin instrucciones específicas',
        prerequisites: ['creative_problem_solving'],
        requiredAccuracy: 0.9,
        examples: 100,
        difficulty: 'expert'
      }
    ];

    // Track progress for each skill
    this.progress = new Map();

    // Current skill being learned
    this.currentSkill = null;

    // Learning history
    this.history = [];

    // Statistics
    this.stats = {
      skillsMastered: 0,
      totalAttempts: 0,
      overallAccuracy: 0,
      currentLevel: 1,
      daysLearning: 0
    };

    console.log('📚 Curriculum Learning Engine initializing...');
  }

  async initialize() {
    if (this.initialized) return;

    // Load progress from storage
    if (window.MLStorage) {
      const stored = await window.MLStorage.get('curriculum_progress');
      if (stored) {
        this.progress = new Map(stored.progress || []);
        this.history = stored.history || [];
        this.stats = stored.stats || this.stats;
        this.currentSkill = stored.currentSkill || null;
      }
    }

    // If no current skill, start with first one
    if (!this.currentSkill) {
      this.currentSkill = this.curriculum[0].id;
    }

    this.initialized = true;
    console.log('✅ Curriculum Learning Engine ready');
    console.log(`📚 Current skill: ${this.getSkill(this.currentSkill).name} (Level ${this.stats.currentLevel})`);
  }

  /**
   * 📖 Get skill by ID
   */
  getSkill(skillId) {
    return this.curriculum.find(s => s.id === skillId);
  }

  /**
   * 🎯 Get current skill to practice
   */
  getCurrentSkill() {
    const skill = this.getSkill(this.currentSkill);

    if (!skill) {
      return null;
    }

    const progress = this.getProgress(skill.id);

    return {
      ...skill,
      progress,
      nextSkill: this.getNextSkill(skill.id)
    };
  }

  /**
   * 📊 Get progress for a skill
   */
  getProgress(skillId) {
    if (!this.progress.has(skillId)) {
      this.progress.set(skillId, {
        skillId,
        attempts: 0,
        successes: 0,
        failures: 0,
        accuracy: 0,
        mastered: false,
        startedAt: Date.now(),
        masteredAt: null
      });
    }

    return this.progress.get(skillId);
  }

  /**
   * ✅ Record attempt at current skill
   * @param {boolean} success - Whether attempt was successful
   * @param {Object} details - Additional details about the attempt
   */
  async recordAttempt(success, details = {}) {
    if (!this.currentSkill) {
      console.error('No current skill set');
      return;
    }

    const skill = this.getSkill(this.currentSkill);
    const progress = this.getProgress(this.currentSkill);

    // Update progress
    progress.attempts++;
    if (success) {
      progress.successes++;
    } else {
      progress.failures++;
    }

    // Calculate accuracy
    progress.accuracy = progress.successes / progress.attempts;

    // Update overall stats
    this.stats.totalAttempts++;
    this.stats.overallAccuracy =
      ((this.stats.overallAccuracy * (this.stats.totalAttempts - 1)) + (success ? 1 : 0)) /
      this.stats.totalAttempts;

    // Record in history
    this.history.push({
      skillId: this.currentSkill,
      success,
      accuracy: progress.accuracy,
      timestamp: Date.now(),
      details
    });

    // Keep only last 1000 attempts
    if (this.history.length > 1000) {
      this.history = this.history.slice(-1000);
    }

    console.log(`📝 Attempt recorded: ${success ? '✅' : '❌'} (${progress.successes}/${progress.attempts}, ${(progress.accuracy * 100).toFixed(1)}% accuracy)`);

    // Check if skill is mastered
    if (!progress.mastered && this.isSkillMastered(progress, skill)) {
      await this.masterSkill(this.currentSkill);
    }

    // Save
    await this.saveState();

    return progress;
  }

  /**
   * 🎓 Check if skill is mastered
   */
  isSkillMastered(progress, skill) {
    return (
      progress.attempts >= skill.examples &&
      progress.accuracy >= skill.requiredAccuracy
    );
  }

  /**
   * 🏆 Mark skill as mastered and advance to next
   */
  async masterSkill(skillId) {
    const skill = this.getSkill(skillId);
    const progress = this.getProgress(skillId);

    progress.mastered = true;
    progress.masteredAt = Date.now();

    this.stats.skillsMastered++;

    console.log(`🏆 SKILL MASTERED: ${skill.name} (Level ${skill.level})`);
    console.log(`   Accuracy: ${(progress.accuracy * 100).toFixed(1)}% (${progress.successes}/${progress.attempts})`);

    // Advance to next skill
    const nextSkillId = this.getNextSkill(skillId);

    if (nextSkillId) {
      this.currentSkill = nextSkillId;
      this.stats.currentLevel = this.getSkill(nextSkillId).level;

      console.log(`📚 Advanced to: ${this.getSkill(nextSkillId).name} (Level ${this.stats.currentLevel})`);
    } else {
      console.log(`🎓 CURRICULUM COMPLETED! All ${this.curriculum.length} skills mastered!`);
      this.currentSkill = null;
    }

    await this.saveState();
  }

  /**
   * ➡️ Get next skill in curriculum
   */
  getNextSkill(currentSkillId) {
    const currentIndex = this.curriculum.findIndex(s => s.id === currentSkillId);

    if (currentIndex === -1 || currentIndex === this.curriculum.length - 1) {
      return null;
    }

    // Check if prerequisites for next skill are met
    const nextSkill = this.curriculum[currentIndex + 1];

    if (this.arePrerequisitesMet(nextSkill)) {
      return nextSkill.id;
    }

    // If prerequisites not met, find next skill with met prerequisites
    for (let i = currentIndex + 1; i < this.curriculum.length; i++) {
      if (this.arePrerequisitesMet(this.curriculum[i])) {
        return this.curriculum[i].id;
      }
    }

    return null;
  }

  /**
   * ✔️ Check if prerequisites for a skill are met
   */
  arePrerequisitesMet(skill) {
    if (!skill.prerequisites || skill.prerequisites.length === 0) {
      return true;
    }

    for (const prereqId of skill.prerequisites) {
      const prereqProgress = this.getProgress(prereqId);
      if (!prereqProgress.mastered) {
        return false;
      }
    }

    return true;
  }

  /**
   * 🔍 Get recommended difficulty for current state
   */
  getRecommendedDifficulty() {
    if (!this.currentSkill) {
      return 'easy';
    }

    const skill = this.getSkill(this.currentSkill);
    const progress = this.getProgress(this.currentSkill);

    // If struggling (< 50% accuracy after 10 attempts), stay at current level
    if (progress.attempts >= 10 && progress.accuracy < 0.5) {
      return 'easier';  // Make it easier
    }

    // If doing well (> 85% accuracy), ready for current difficulty
    if (progress.accuracy > 0.85) {
      return skill.difficulty;
    }

    // Otherwise, stick with current difficulty
    return skill.difficulty;
  }

  /**
   * 📈 Get learning trajectory
   * Shows how accuracy improved over time
   */
  getLearningTrajectory(skillId = null) {
    const targetSkillId = skillId || this.currentSkill;

    if (!targetSkillId) {
      return [];
    }

    // Get attempts for this skill
    const attempts = this.history.filter(h => h.skillId === targetSkillId);

    // Calculate rolling accuracy (window of 10)
    const trajectory = [];
    const windowSize = 10;

    for (let i = windowSize; i <= attempts.length; i++) {
      const window = attempts.slice(i - windowSize, i);
      const successes = window.filter(a => a.success).length;
      const accuracy = successes / windowSize;

      trajectory.push({
        attempt: i,
        accuracy,
        timestamp: window[window.length - 1].timestamp
      });
    }

    return trajectory;
  }

  /**
   * 🎯 Get skills summary
   */
  getSkillsSummary() {
    return this.curriculum.map(skill => {
      const progress = this.getProgress(skill.id);

      return {
        id: skill.id,
        name: skill.name,
        level: skill.level,
        difficulty: skill.difficulty,
        mastered: progress.mastered,
        accuracy: progress.accuracy,
        attempts: progress.attempts,
        progress: progress.mastered
          ? 100
          : Math.min((progress.accuracy / skill.requiredAccuracy) * 100, 99),
        isCurrent: skill.id === this.currentSkill,
        prerequisitesMet: this.arePrerequisitesMet(skill)
      };
    });
  }

  /**
   * 📊 Get statistics
   */
  getStats() {
    const completionRate = (this.stats.skillsMastered / this.curriculum.length) * 100;

    return {
      currentLevel: this.stats.currentLevel,
      currentSkill: this.currentSkill ? this.getSkill(this.currentSkill).name : 'Completed',
      skillsMastered: this.stats.skillsMastered,
      totalSkills: this.curriculum.length,
      completionRate: completionRate.toFixed(1) + '%',
      totalAttempts: this.stats.totalAttempts,
      overallAccuracy: (this.stats.overallAccuracy * 100).toFixed(1) + '%',
      daysLearning: this.stats.daysLearning,
      skillsSummary: this.getSkillsSummary()
    };
  }

  /**
   * 🔄 Reset skill (for practice)
   */
  async resetSkill(skillId) {
    const progress = this.getProgress(skillId);

    progress.attempts = 0;
    progress.successes = 0;
    progress.failures = 0;
    progress.accuracy = 0;
    progress.mastered = false;
    progress.masteredAt = null;
    progress.startedAt = Date.now();

    await this.saveState();

    console.log(`🔄 Skill ${skillId} reset for practice`);
  }

  /**
   * 💾 Save state
   */
  async saveState() {
    if (!window.MLStorage) return;

    await window.MLStorage.set('curriculum_progress', {
      progress: Array.from(this.progress.entries()),
      history: this.history,
      stats: this.stats,
      currentSkill: this.currentSkill,
      timestamp: Date.now()
    });
  }

  /**
   * 🧹 Reset entire curriculum
   */
  async reset() {
    this.progress.clear();
    this.history = [];
    this.stats = {
      skillsMastered: 0,
      totalAttempts: 0,
      overallAccuracy: 0,
      currentLevel: 1,
      daysLearning: 0
    };
    this.currentSkill = this.curriculum[0].id;

    await this.saveState();

    console.log('🧹 Curriculum reset - starting from Level 1');
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.CurriculumLearningEngine = new CurriculumLearningEngine();

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.CurriculumLearningEngine.initialize().catch(e => {
        console.error('Failed to initialize Curriculum Learning Engine:', e);
      });
    });
  } else {
    window.CurriculumLearningEngine.initialize().catch(e => {
      console.error('Failed to initialize Curriculum Learning Engine:', e);
    });
  }

  console.log('📚 Curriculum Learning Engine loaded!');
}
