import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { SensorDAO as Sensor} from "./SensorDAO";


@Entity("measurements")
export class MeasurementDAO {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "float", nullable: false })
  value: number;

  @Column({ type: "datetime", nullable: false })
  createdAt: Date;

  @ManyToOne(() => Sensor, (sensor) => sensor.measurements, { 
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: 'sensorId' })
  sensor: Sensor;
  
}