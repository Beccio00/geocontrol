import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { SensorDAO } from "./SensorDAO";

@Entity("measurements")
export class MeasurementDAO {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "float", nullable: false })
  value: number;

  @Column({ type: "timestamp", nullable: false })
  createdAt: Date;

  @Column({ type: "boolean", nullable: true })
  isOutlier?: boolean;

  @ManyToOne(() => SensorDAO, (sensor) => sensor.measurements, { nullable: false })
  sensor: SensorDAO;
}