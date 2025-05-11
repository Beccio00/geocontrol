import { CONFIG } from "@config";
import AppError from "@models/errors/AppError";
import { Router } from "express";
import { createMeasurement, getMeasurementsBySensor, getMeasurementsBySensorsAndNetwork, getNetworkOutliers, getNetworkStats, getSensorOutliers, getSensorStats } from "@controllers/measurementController";
import { authenticateUser } from "@middlewares/authMiddleware";
import { UserType } from "@models/UserType";
import { MeasurementFromJSON } from "@models/dto/Measurement";

const router = Router();

// Store a measurement for a sensor (Admin & Operator)
router.post(CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/measurements",authenticateUser([UserType.Admin, UserType.Operator]),
  async (req, res, next) => {
    try {
      await createMeasurement(req.params.networkCode, req.params.gatewayMac, req.params.sensorMac, MeasurementFromJSON(req.body).value, MeasurementFromJSON(req.body).createdAt);
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
      const measurements = await getMeasurementsBySensor(req.params.networkCode, req.params.gatewayMac, req.params.sensorMac);
      res.status(200).json(measurements);
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve statistics for a specific sensor
router.get(CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/stats", authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  (req, res, next) => {
    try {
      const stats = getSensorStats(req.params.networkCode, req.params.gatewayMac, req.params.sensorMac);
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
});

// Retrieve only outliers for a specific sensor
router.get(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/outliers", authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  (req, res, next) => {
    try {
      const outliers = getSensorOutliers(req.params.networkCode, req.params.gatewayMac, req.params.sensorMac);
      res.status(200).json(outliers);
    } catch (error) {
      next(error);
    } 
  }
);

// Retrieve measurements for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/measurements", authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  (req, res, next) => {
    try {
      const measurements = getMeasurementsBySensorsAndNetwork(req.params.networkCode, req.query.sensorMacs as string[]);
      res.status(200).json(measurements);
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve statistics for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/stats",authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  (req, res, next) => {
    try {
      const stats = getNetworkStats(req.params.networkCode, req.query.sensorMacs as string[]);
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve only outliers for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/outliers",authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  (req, res, next) => {
    try {
      const outliers = getNetworkOutliers(req.params.networkCode, req.query.sensorMacs as string[]);
      res.status(200).json(outliers);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
