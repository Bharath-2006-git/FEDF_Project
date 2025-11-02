import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';

interface EmissionStats {
  todayEntries: number;
  weekEntries: number;
  monthEmissions: number;
  todayChange: number;
  weekDays: number;
}

export function useEmissionStats() {
  const [stats, setStats] = useState<EmissionStats>({
    todayEntries: 0,
    weekEntries: 0,
    monthEmissions: 0,
    todayChange: 0,
    weekDays: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - 7);
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      // Fetch data with fresh requests
      const [todayData, weekData, monthData, yesterdayData] = await Promise.all([
        apiService.getEmissionsSummary(today.toISOString().split('T')[0], today.toISOString().split('T')[0]),
        apiService.getEmissionsSummary(startOfWeek.toISOString().split('T')[0], today.toISOString().split('T')[0]),
        apiService.getEmissionsSummary(startOfMonth.toISOString().split('T')[0], today.toISOString().split('T')[0]),
        apiService.getEmissionsSummary(yesterday.toISOString().split('T')[0], yesterday.toISOString().split('T')[0])
      ]);

      // Update stats with new data
      const newStats = {
        todayEntries: todayData.totalEntries || 0,
        weekEntries: weekData.totalEntries || 0,
        monthEmissions: Math.round((monthData.totalEmissions || 0) * 10) / 10,
        todayChange: (todayData.totalEntries || 0) - (yesterdayData.totalEntries || 0),
        weekDays: weekData.uniqueDays || 0
      };
      
      console.log('📊 Updated stats:', newStats);
      setStats(newStats);
    } catch (err) {
      console.error('Failed to load statistics:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return { stats, loading, error, reload: loadStats };
}
