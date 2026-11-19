class SessionDTO {
  static toDetail(session) {
    if (!session) return null;
    return {
      id: session._id ? session._id.toString() : session.id,
      userId: session.userId || session.user,
      title: session.title,
      tradition: session.tradition || 'general',
      category: session.category || 'Meditation',
      duration: session.duration,
      durationCompleted: session.durationCompleted || 0,
      completed: !!session.completed,
      startTime: session.startTime,
      endTime: session.endTime || null,
      biomarkers: {
        baseline: {
          heartRate: session.baselineHeartRate,
          hrv: session.baselineHrv,
          calmScore: session.baselineCalmScore,
          mood: session.moodBefore || ''
        },
        exit: {
          heartRate: session.exitHeartRate,
          hrv: session.exitHrv,
          calmScore: session.exitCalmScore,
          mood: session.moodAfter || ''
        },
        deltas: {
          heartRateDelta: session.heartRateDelta || 0,
          hrvDelta: session.hrvDelta || 0,
          calmDelta: session.calmDelta || 0
        },
        breathSyncScore: session.breathSyncScore || 85
      },
      pacing: {
        breathRatios: session.breathRatios || { inhale: 4, hold: 4, exhale: 4, postHold: 0 },
        stages: session.stages || []
      },
      summary: session.summary || '',
      notes: session.notes || '',
      createdAt: session.createdAt
    };
  }

  static toListItem(session) {
    if (!session) return null;
    return {
      id: session._id ? session._id.toString() : session.id,
      title: session.title,
      tradition: session.tradition || 'general',
      category: session.category || 'Meditation',
      duration: session.duration,
      durationCompleted: session.durationCompleted || 0,
      completed: !!session.completed,
      moodBefore: session.moodBefore || '',
      moodAfter: session.moodAfter || '',
      calmDelta: session.calmDelta || 0,
      breathSyncScore: session.breathSyncScore || 85,
      createdAt: session.createdAt
    };
  }

  static toPaginatedList(sessions, pagination) {
    return {
      items: sessions.map(SessionDTO.toListItem),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit)
      }
    };
  }
}

module.exports = SessionDTO;

