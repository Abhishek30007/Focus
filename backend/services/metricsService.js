const sessionRepository = require('../repositories/sessionRepository');

class MetricsService {
  constructor(sessionRepo = sessionRepository) {
    this.sessionRepo = sessionRepo;
  }

  async getTrends(userId, period = 'weekly') {
    const days = period === 'monthly' ? 30 : 7;
    const rawBreakdown = await this.sessionRepo.aggregateTrends(userId, days);

    let totalSessions = 0;
    let totalMinutes = 0;
    let sumCalmDelta = 0;
    let sumHrvDelta = 0;
    let sumHeartRateDelta = 0;
    let sumBreathSync = 0;

    const dailyBreakdown = rawBreakdown.map(day => {
      totalSessions += day.sessionCount;
      totalMinutes += day.totalMinutes;
      sumCalmDelta += (day.avgCalmDelta || 0) * day.sessionCount;
      sumHrvDelta += (day.avgHrvDelta || 0) * day.sessionCount;
      sumHeartRateDelta += (day.avgHeartRateDelta || 0) * day.sessionCount;
      sumBreathSync += (day.avgBreathSyncScore || 85) * day.sessionCount;

      return {
        date: day._id,
        sessionCount: day.sessionCount,
        minutes: Math.round(day.totalMinutes),
        calmDelta: Number((day.avgCalmDelta || 0).toFixed(1)),
        hrvDelta: Number((day.avgHrvDelta || 0).toFixed(1)),
        heartRateDelta: Number((day.avgHeartRateDelta || 0).toFixed(1)),
        breathSyncScore: Math.round(day.avgBreathSyncScore || 85)
      };
    });

    const avgCalmDelta = totalSessions > 0 ? sumCalmDelta / totalSessions : 0;
    const avgHrvDelta = totalSessions > 0 ? sumHrvDelta / totalSessions : 0;
    const avgHeartRateDelta = totalSessions > 0 ? sumHeartRateDelta / totalSessions : 0;
    const avgBreathSyncScore = totalSessions > 0 ? sumBreathSync / totalSessions : 85;

    return {
      period,
      totalSessions,
      totalMinutes: Math.round(totalMinutes),
      avgBreathSyncScore,
      avgCalmDelta,
      avgHrvDelta,
      avgHeartRateDelta,
      dailyBreakdown
    };
  }
}

module.exports = new MetricsService();

