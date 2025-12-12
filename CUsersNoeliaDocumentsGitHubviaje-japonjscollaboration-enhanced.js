/**
 * 🤝 COLLABORATION ENHANCEMENTS
 * =============================
 * Voting, real-time chat, roles
 */

class CollaborationEnhanced {
  constructor() {
    this.votes = {};
    this.messages = [];
    this.roles = {admin: [], editor: [], viewer: []};
  }

  voteActivity(activityId, userId, vote) {
    if (!this.votes[activityId]) this.votes[activityId] = {};
    this.votes[activityId][userId] = vote; // 1 or -1
    return this.getVoteCount(activityId);
  }

  getVoteCount(activityId) {
    const votes = this.votes[activityId] || {};
    return Object.values(votes).reduce((sum, v) => sum + v, 0);
  }

  sendMessage(userId, message) {
    this.messages.push({userId, message, timestamp: Date.now()});
    // In real app: Firebase realtime database
  }

  setRole(userId, role) {
    Object.keys(this.roles).forEach(r => {
      this.roles[r] = this.roles[r].filter(id => id !== userId);
    });
    if (this.roles[role]) this.roles[role].push(userId);
  }

  canEdit(userId) {
    return this.roles.admin.includes(userId) || this.roles.editor.includes(userId);
  }
}

if (typeof window !== 'undefined') {
  window.CollaborationEnhanced = new CollaborationEnhanced();
}
