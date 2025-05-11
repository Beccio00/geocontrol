import { Measurement } from "@dto/Measurement";
import { Stats } from "@dto/Stats";

/**
 * Calculate statistics (mean, variance, thresholds) for a set of measurements.
 * @param measurements The list of measurements.
 * @returns The calculated statistics.
 */
export function calculateStats(measurements: Measurement[]): Stats {
  if (measurements.length === 0) {
    return {
      mean: 0,
      variance: 0,
      upperThreshold: 0,
      lowerThreshold: 0,
    };
  }

  // Extract measurement values
  const values = measurements.map((m) => m.value);

  // Calculate mean
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;

  // Calculate variance
  const variance =
    values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
    values.length;

  // Calculate thresholds
  const upperThreshold = mean + 2 * Math.sqrt(variance);
  const lowerThreshold = mean - 2 * Math.sqrt(variance);

  // Return the calculated statistics
  return {
    mean,
    variance,
    upperThreshold,
    lowerThreshold,
  };
}