import { CONFIG } from "@config";
import AppError from "@models/errors/AppError";
import { Router } from "express";
import { createMeasurement, getMeasurementsBySensor, getMeasurementsBySensorsAndNetwork, getNetworkOutliers, getNetworkStats, getSensorOutliers, getSensorStats, storeMeasurements } from "@controllers/measurementController";
import { authenticateUser } from "@middlewares/authMiddleware";
import { UserType } from "@models/UserType";
import { MeasurementFromJSON } from "@models/dto/Measurement";
import { SensorFromJSON } from "@models/dto/Sensor";

const router = Router();

// Store a measurement for a sensor (Admin & Operator)
router.post(CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/measurements",authenticateUser([UserType.Admin, UserType.Operator]),
  async (req, res, next) => {
    try {
      const measurements = req.body.map((measurement: any) => MeasurementFromJSON(measurement));
      await storeMeasurements(req.params.networkCode, req.params.gatewayMac, req.params.sensorMac, measurements);
      res.status(201).send();
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve measurements for a specific sensor
router.get(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/measurements", authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const measurements = await getMeasurementsBySensor(req.params.networkCode, req.params.gatewayMac, req.params.sensorMac, req.query.startDate as string, req.query.endDate as string);
      res.status(200).json(measurements);
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve statistics for a specific sensor
router.get(CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/stats", authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const stats =await getSensorStats(req.params.networkCode, req.params.gatewayMac, req.params.sensorMac, req.query.startDate as string, req.query.endDate as string);
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
});

// Retrieve only outliers for a specific sensor
router.get(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/outliers", authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async(req, res, next) => {
    try {
      const outliers = await getSensorOutliers(req.params.networkCode, req.params.gatewayMac, req.params.sensorMac, req.query.startDate as string, req.query.endDate as string);
      res.status(200).json(outliers);
    } catch (error) {
      next(error);
    } 
  }
);

// Retrieve measurements for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/measurements", authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async(req, res, next) => {
    try {
      const measurements = await getMeasurementsBySensorsAndNetwork(req.params.networkCode, req.query.sensorMacs as string[], req.query.startDate as string, req.query.endDate as string);
      res.status(200).json(measurements);
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve statistics for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/stats",authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const raw= req.query.sensorMacs as string;
      const sensorMacs=JSON.parse(raw) as string[];
      const stats = await getNetworkStats(req.params.networkCode, sensorMacs, req.query.startDate as string, req.query.endDate as string);
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve only outliers for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/outliers",authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const outliers = await getNetworkOutliers(req.params.networkCode, req.query.sensorMacs as string[], req.query.startDate as string, req.query.endDate as string);
      res.status(200).json(outliers);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
