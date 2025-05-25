import { MeasurementDAO } from "@models/dao/MeasurementDAO";

export function processMeasurements(measurements : MeasurementDAO[], upperThreshold : number, lowerThreshold : number){
    return measurements.map(m => {
        const isOutlier = m.value < lowerThreshold || m.value > upperThreshold;
        return [m, isOutlier] as [MeasurementDAO, boolean];
    });
}

export  function calcStats(measurements : MeasurementDAO[]){
    if (measurements.length === 0) {
        return {
            mean: 0.00,
            variance: 0.00,
            upperThreshold: 0.00,
            lowerThreshold: 0.00,
        };
    }
    const values = measurements.map(m => m.value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;

    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;

    const stdDev = Math.sqrt(variance);

    const upperThreshold = mean + 2 * stdDev;
    const lowerThreshold = mean - 2 * stdDev;

    // Funzione helper per arrotondare a 2 decimali
    const round2 = (num: number) => Math.round(num * 100) / 100;

    return {
        mean: round2(mean),
        variance: round2(variance),
        upperThreshold: round2(upperThreshold),
        lowerThreshold: round2(lowerThreshold),
    };
}

export function groupMeasurementsBySensor(measurements: MeasurementDAO[]): Record<string, MeasurementDAO[]> {
    const groupedMeasurements: Record<string, MeasurementDAO[]> = {};
    measurements.forEach(measurement => {
        const sensorMac = measurement.sensor.macAddress;
        if (!groupedMeasurements[sensorMac]) {
            groupedMeasurements[sensorMac] = [];
        }
        groupedMeasurements[sensorMac].push(measurement);
        return groupedMeasurements;
    });
    return groupedMeasurements;
}