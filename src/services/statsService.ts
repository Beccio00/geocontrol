import { Measurement } from "@dto/Measurement";
import { Measurements } from "@models/dto/Measurements";
import { Stats } from "@dto/Stats";

/**
 * Calculate statistics (mean, variance, thresholds) for a set of measurements.
 * @param measurements The list of measurements.
 * @returns The calculated statistics.
 */
export function calculateStats(measurements: Measurement[]): Stats {
  if (measurements.length === 0) {
    return {
        startDate: undefined,
        endDate: undefined,
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

  
  // Calculate startDate and endDate
  const startDate = new Date(
    Math.min(...measurements.map((m) => m.createdAt.getTime()))
  );
  const endDate = new Date(
    Math.max(...measurements.map((m) => m.createdAt.getTime()))
  );
  // Return the calculated statistics
  return {
    startDate,
    endDate,
    mean,
    variance,
    upperThreshold,
    lowerThreshold,
  };
}

export function processMeasurements(
    measurements: Measurement[],
    sensorMac?: string
  ): Measurements {
    let stats;
    // Calculate statistics for the measurements
    if (measurements.length === 0) { 
        stats = {
            startDate: undefined,
            endDate: undefined,
            mean: 0,
            variance: 0,
            upperThreshold: 0,
            lowerThreshold: 0,
        };
    }
    else {
     stats = calculateStats(measurements);
    }
    // Update the isOutlier property for each measurement
    measurements.forEach((measurement) => {
      measurement.isOutlier =
        measurement.value > stats.upperThreshold ||
        measurement.value < stats.lowerThreshold;
    });
  
    // Return an instance of Measurements
    return {
      sensorMacAddress: sensorMac,
      measurements,
      stats,
    };
  }