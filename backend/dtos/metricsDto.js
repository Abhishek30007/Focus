class MetricsDTO {
  static toTrends(trends) {
    return {
      period: trends.period || 'weekly',
      totalSessions: trends.totalSessions || 0,
      totalMinutes: trends.totalMinutes || 0,
      avgBreathSyncScore: Math.round(trends.avgBreathSyncScore || 0),
      avgCalmDelta: Number((trends.avgCalmDelta || 0).toFixed(1)),
      avgHrvDelta: Number((trends.avgHrvDelta || 0).toFixed(1)),
      avgHeartRateDelta: Number((trends.avgHeartRateDelta || 0).toFixed(1)),
      dailyBreakdown: trends.dailyBreakdown || [],
      traditionDistribution: trends.traditionDistribution || {}
    };
  }
}

module.exports = MetricsDTO;

