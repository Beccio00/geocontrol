import { generateToken } from "@services/authService";
import { afterAllE2e, beforeAllE2e, TEST_USERS } from "../lifecycle";
import request from "supertest";
import { app } from "@app";

describe("Measurements API (e2e)", () => {
    let token: string;
    const networkCode = "test-network";
    const fakeNetworkCode = "fake-network"
    const gatewayMac = "00:11:22:33:44:55";
    const fakeGatewayMac = "AA:BB:CC:DD:EE:FF";
    const sensorMac1 = "71:B1:CE:01:C6:A9";
    const sensorMac2 = "71:B1:CE:01:C6:A7";    

    const startDate : string = "2025-01-18T16:10:00+01:00";
    const endDate : string = "2025-01-18T16:50:00+01:00";
    const lowerEndDate : string = "2025-01-18T15:00:00+01:00";

    const measurements = [
        {
            "createdAt": "2025-01-18T16:00:00+01:00",
            "value": 3.8
        },
        {
            "createdAt": "2025-01-18T16:10:00+01:00",
            "value": 24.9
        },
        {
            "createdAt": "2025-01-18T16:20:00+01:00",
            "value": 4.0
        },
        {
            "createdAt": "2025-01-18T16:30:00+01:00",
            "value": 4.1
        },
        {
            "createdAt": "2025-01-18T16:40:00+01:00",
            "value": 4.3
        },
        {
            "createdAt": "2025-01-18T16:50:00+01:00",
            "value": 4.4
        },
        {
            "createdAt": "2025-01-18T16:50:00+01:00",
            "value": 4.5
        },
        {
            "createdAt": "2025-01-18T17:00:00+01:00",
            "value": 4.6
        }
    ];

    beforeAll(async () => {
        await beforeAllE2e();
        token = generateToken(TEST_USERS.admin);

        await request(app)
        .post("/api/v1/networks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            code: networkCode,
            name: "Test Network",
            description: "A test network",
        });
        await request(app)
        .post("/api/v1/networks")
        .set("Authorization", `Bearer ${token}`)
        .send({
            code: fakeNetworkCode,
            name: "Empty Network",
            description: "An empty network",
        });
    
        await request(app)        
        .post(`/api/v1/networks/${networkCode}/gateways`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            macAddress: gatewayMac,
            name: "Test Gateway",
            description: "A test gateway",
        });
        await request(app)        
        .post(`/api/v1/networks/${networkCode}/gateways`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            macAddress: fakeGatewayMac,
            name: "Empty Gateway",
            description: "An empty gateway",
        });

        await request(app)
        .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            macAddress: sensorMac1,
            name: "Test Sensor",
            description: "A test sensor",
            variable: "temperature",
            unit: "C",
        });
        await request(app)
        .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            macAddress: sensorMac2,
            name: "Empty Sensor",
            description: "An empty sensor",
            variable: "temperature",
            unit: "C",
        });
    });

    afterAll(async () => {
        await afterAllE2e();
    });

    describe("POST /networks/{networkCode}/gateways/{gatewayMac}/sensors/{sensorMac}/measurements", () =>{
        it("store measurements", async () =>{
            const res = await request(app)
            .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac1}/measurements`)
            .set("Authorization", `Bearer ${token}`)
            .send(measurements);

            expect(res.status).toBe(201);
        })
        it("store measurements for a sensor in a no existing network", async () =>{
            const res = await request(app)
            .post(`/api/v1/networks/ghost/gateways/${gatewayMac}/sensors/${sensorMac1}/measurements`)
            .set("Authorization", `Bearer ${token}`)
            .send(measurements);

            expect(res.status).toBe(404);
        })
    })
    describe("GET /networks/{networkCode}/measurements", () =>{    
        //ADD -> net sbagliata, net con nessun gateway
        it("get network measurement for an unexisting network", async() =>{
            const res = await request(app)
            .get(`/api/v1/networks/ghost/measurements`)
            .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(404);

        })
        it("get network measurement for a network with no gateways", async() =>{
            const res = await request(app)
            .get(`/api/v1/networks/${fakeNetworkCode}/measurements`)
            .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(0);
        })        
        it("get network measurements with date range", async() =>{
            const res = await request(app)
            .get(`/api/v1/networks/${networkCode}/measurements`)
            .set("Authorization", `Bearer ${token}`)
            .query({ startDate, endDate});

            expect(res.status).toBe(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(2);
            const s1 = res.body[0];            
            expect(s1).toHaveProperty("sensorMacAddress");
            expect(typeof s1.sensorMacAddress).toBe("string");

            expect(s1).toHaveProperty("stats");
            expect(s1.stats).toEqual(
                expect.objectContaining({
                    mean: expect.any(Number),
                    variance: expect.any(Number),
                    upperThreshold: expect.any(Number),
                    lowerThreshold: expect.any(Number),
                    startDate: expect.any(String),
                    endDate: expect.any(String),
                })
            );

            expect(s1).toHaveProperty("measurements");
            expect(Array.isArray(s1.measurements)).toBe(true);
            expect(s1.measurements).toHaveLength(6);
            const ms1 = s1.measurements[0];
            expect(ms1).toEqual(
                expect.objectContaining({
                    createdAt: expect.any(String),
                    value: expect.any(Number) ,
                    isOutlier: expect.any(Boolean),
                })
            );
            
            const createdAtTime = new Date(ms1.createdAt).getTime();
            const startDateTime = new Date(startDate).getTime();
            const endDateTime = new Date(endDate).getTime();

            expect(createdAtTime).toBeGreaterThanOrEqual(startDateTime);
            expect(createdAtTime).toBeLessThanOrEqual(endDateTime);
            
            const s2 = res.body[1];

            expect(s2).toHaveProperty("sensorMacAddress");
            expect(typeof s2.sensorMacAddress).toBe("string");

            expect(s2).toHaveProperty("stats");
            expect(s2).not.toHaveProperty("measurements");

        })
        it("get network measurements with only startDate", async() =>{
            const res = await request(app)
            .get(`/api/v1/networks/${networkCode}/measurements`)
            .set("Authorization", `Bearer ${token}`)
            .query({ startDate });

            expect(res.status).toBe(200);
                        expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(2);
            const s1 = res.body[0];            
            expect(s1).toHaveProperty("sensorMacAddress");
            expect(typeof s1.sensorMacAddress).toBe("string");

            expect(s1).toHaveProperty("stats");
            expect(s1.stats).not.toHaveProperty("endDate");
            expect(s1.stats).toEqual(
                expect.objectContaining({
                    mean: expect.any(Number),
                    variance: expect.any(Number),
                    upperThreshold: expect.any(Number),
                    lowerThreshold: expect.any(Number),
                    startDate: expect.any(String)
                })
            );

            expect(s1).toHaveProperty("measurements");
            expect(Array.isArray(s1.measurements)).toBe(true);
            expect(s1.measurements).toHaveLength(7);
            const ms1 = s1.measurements[0];
            expect(ms1).toEqual(
                expect.objectContaining({
                    createdAt: expect.any(String),
                    value: expect.any(Number) ,
                    isOutlier: expect.any(Boolean),
                })
            );
            
            const createdAtTime = new Date(ms1.createdAt).getTime();
            const startDateTime = new Date(startDate).getTime();

            expect(createdAtTime).toBeGreaterThanOrEqual(startDateTime);
            
            const s2 = res.body[1];

            expect(s2).toHaveProperty("sensorMacAddress");
            expect(typeof s2.sensorMacAddress).toBe("string");

            expect(s2).toHaveProperty("stats");
            expect(s2).not.toHaveProperty("measurements");
        })
        it("get network measurements with only endDate", async() =>{
            const res = await request(app)
            .get(`/api/v1/networks/${networkCode}/measurements`)
            .set("Authorization", `Bearer ${token}`)
            .query({ endDate });

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(2);
            const s1 = res.body[0];            
            expect(s1).toHaveProperty("sensorMacAddress");
            expect(typeof s1.sensorMacAddress).toBe("string");

            expect(s1).toHaveProperty("stats");
            expect(s1.stats).not.toHaveProperty("startDate");
            expect(s1.stats).toEqual(
                expect.objectContaining({
                    mean: expect.any(Number),
                    variance: expect.any(Number),
                    upperThreshold: expect.any(Number),
                    lowerThreshold: expect.any(Number),
                    endDate: expect.any(String),
                })
            );

            expect(s1).toHaveProperty("measurements");
            expect(Array.isArray(s1.measurements)).toBe(true);
            expect(s1.measurements).toHaveLength(7);
            const ms1 = s1.measurements[0];
            expect(ms1).toEqual(
                expect.objectContaining({
                    createdAt: expect.any(String),
                    value: expect.any(Number) ,
                    isOutlier: expect.any(Boolean),
                })
            );
            
            const createdAtTime = new Date(ms1.createdAt).getTime();
            const endDateTime = new Date(endDate).getTime();

            expect(createdAtTime).toBeLessThanOrEqual(endDateTime);
            
            const s2 = res.body[1];

            expect(s2).toHaveProperty("sensorMacAddress");
            expect(typeof s2.sensorMacAddress).toBe("string");

            expect(s2).toHaveProperty("stats");
            expect(s2).not.toHaveProperty("measurements");
        })
        it("get network measurements with no date", async() =>{
            const res = await request(app)
            .get(`/api/v1/networks/${networkCode}/measurements`)
            .set("Authorization", `Bearer ${token}`)

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(2);
            const s1 = res.body[0];            
            expect(s1).toHaveProperty("sensorMacAddress");
            expect(typeof s1.sensorMacAddress).toBe("string");

            expect(s1).toHaveProperty("stats");
            expect(s1.stats).not.toHaveProperty("startDate");
            expect(s1.stats).not.toHaveProperty("endDate");
            expect(s1.stats).toEqual(
                expect.objectContaining({
                    mean: expect.any(Number),
                    variance: expect.any(Number),
                    upperThreshold: expect.any(Number),
                    lowerThreshold: expect.any(Number)
                })
            );

            expect(s1).toHaveProperty("measurements");
            expect(Array.isArray(s1.measurements)).toBe(true);
            expect(s1.measurements).toHaveLength(8);
            const ms1 = s1.measurements[0];
            expect(ms1).toEqual(
                expect.objectContaining({
                    createdAt: expect.any(String),
                    value: expect.any(Number) ,
                    isOutlier: expect.any(Boolean),
                })
            );
            
            const s2 = res.body[1];

            expect(s2).toHaveProperty("sensorMacAddress");
            expect(typeof s2.sensorMacAddress).toBe("string");

            expect(s2).toHaveProperty("stats");
            expect(s2).not.toHaveProperty("measurements");

        })
        it("get network measurements with startDate greather than endDate", async() =>{
            const res = await request(app)
            .get(`/api/v1/networks/${networkCode}/measurements`)
            .set("Authorization", `Bearer ${token}`)
            .query({ startDate, endDate : lowerEndDate});

            expect(res.status).toBe(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(2);
            const s1 = res.body[1];

            expect(s1).toHaveProperty("sensorMacAddress");
            expect(typeof s1.sensorMacAddress).toBe("string");

            expect(s1).toHaveProperty("stats");
            expect(s1).not.toHaveProperty("measurements");

            const s2 = res.body[1];

            expect(s2).toHaveProperty("sensorMacAddress");
            expect(typeof s2.sensorMacAddress).toBe("string");

            expect(s2).toHaveProperty("stats");
            expect(s2).not.toHaveProperty("measurements");
        })
        it("get network measurements with multiple existing sensorMACs", async() =>{
            const res = await request(app)
            .get(`/api/v1/networks/${networkCode}/measurements`)
            .set("Authorization", `Bearer ${token}`)
            .query({ sensorMacs : [sensorMac1,sensorMac2]});

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(2);
        })
        it("get network measurements without sensorMACs", async() =>{
            const res = await request(app)
            .get(`/api/v1/networks/${networkCode}/measurements`)
            .set("Authorization", `Bearer ${token}`)

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(2);
        })
        it("get network measurements with one incorrect sensorMac", async() =>{
            const res = await request(app)
            .get(`/api/v1/networks/${networkCode}/measurements`)
            .set("Authorization", `Bearer ${token}`)
            .query({ sensorMacs : [sensorMac1,"abcdefgh"]});

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(1);
        })
        it("get network measurements with all incorrect sensorMac", async() =>{
            const res = await request(app)
            .get(`/api/v1/networks/${networkCode}/measurements`)
            .set("Authorization", `Bearer ${token}`)
            .query({ sensorMacs : ["1234567","abcdefgh"]});

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(0);
        })
    })
    describe("GET /networks/{networkCode}/stats", () =>{
        it("get network stats", async() =>{
            const res = await request(app)
            .get(`/api/v1/networks/${networkCode}/stats`)
            .set("Authorization", `Bearer ${token}`)

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(2);
            const s1 = res.body[0];            
            expect(s1).toHaveProperty("sensorMacAddress");
            expect(typeof s1.sensorMacAddress).toBe("string");

            expect(s1).toHaveProperty("stats");
            expect(s1.stats).not.toHaveProperty("startDate");
            expect(s1.stats).not.toHaveProperty("endDate");
            expect(s1.stats).toEqual(
                expect.objectContaining({
                    mean: expect.any(Number),
                    variance: expect.any(Number),
                    upperThreshold: expect.any(Number),
                    lowerThreshold: expect.any(Number)
                })
            );

            expect(s1).not.toHaveProperty("measurements");            
            
            const s2 = res.body[1];

            expect(s2).toHaveProperty("sensorMacAddress");
            expect(typeof s2.sensorMacAddress).toBe("string");

            expect(s2).toHaveProperty("stats");
            expect(s2).not.toHaveProperty("measurements");
        })
         it("get network stats for an non existing network", async() =>{
            const res = await request(app)
            .get(`/api/v1/networks/ghost/stats`)
            .set("Authorization", `Bearer ${token}`)

            expect(res.status).toBe(404);
            
        })
    })
    describe("GET /networks/{networkCode}/outliers", () =>{
        it("get network outliers", async() =>{
            const res = await request(app)
            .get(`/api/v1/networks/${networkCode}/outliers`)
            .set("Authorization", `Bearer ${token}`)

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(2);
            const s1 = res.body[0];            
            expect(s1).toHaveProperty("sensorMacAddress");
            expect(typeof s1.sensorMacAddress).toBe("string");

            expect(s1).toHaveProperty("stats");
            expect(s1.stats).not.toHaveProperty("startDate");
            expect(s1.stats).not.toHaveProperty("endDate");
            expect(s1.stats).toEqual(
                expect.objectContaining({
                    mean: expect.any(Number),
                    variance: expect.any(Number),
                    upperThreshold: expect.any(Number),
                    lowerThreshold: expect.any(Number)
                })
            );

            expect(s1).toHaveProperty("measurements");
            expect(Array.isArray(s1.measurements)).toBe(true);
            expect(s1.measurements).toHaveLength(1);
            const ms1 = s1.measurements[0];
            expect(ms1).toEqual(
                expect.objectContaining({
                    createdAt: "2025-01-18T15:10:00.000Z",
                    value: 24.9,
                    isOutlier: true,
                })
            );
            
            const s2 = res.body[1];

            expect(s2).toHaveProperty("sensorMacAddress");
            expect(typeof s2.sensorMacAddress).toBe("string");

            expect(s2).toHaveProperty("stats");
            expect(s2).not.toHaveProperty("measurements");
        })
        it("get network outliers for an non existing network", async() =>{
            const res = await request(app)
            .get(`/api/v1/networks/ghost/outliers`)
            .set("Authorization", `Bearer ${token}`)

            expect(res.status).toBe(404);
            
        })
        
    })
    describe("GET /networks/{networkCode}/gateways/{gatewayMac}/sensors/{sensorMac}/measurements", () =>{
        it("get sensor measurements with no existing network", async() =>{
            const res = await request(app)
            .get(`/api/v1/networks/ghost/gateways/${gatewayMac}/sensors/${sensorMac1}/measurements`)
            .set("Authorization", `Bearer ${token}`)

            expect(res.status).toBe(404);

        })
        it("get sensor measurements with date range", async() =>{
            const res = await request(app)
            .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac1}/measurements`)
            .set("Authorization", `Bearer ${token}`)
            .query({ startDate, endDate});

            expect(res.status).toBe(200);

            expect(res.body).toHaveProperty("sensorMacAddress");
            expect(typeof res.body.sensorMacAddress).toBe("string");

            expect(res.body).toHaveProperty("stats");
            expect(res.body.stats).toEqual(
                expect.objectContaining({
                    mean: expect.any(Number),
                    variance: expect.any(Number),
                    upperThreshold: expect.any(Number),
                    lowerThreshold: expect.any(Number),
                    startDate: expect.any(String),
                    endDate: expect.any(String),
                })
            );

            expect(res.body).toHaveProperty("measurements");
            expect(Array.isArray(res.body.measurements)).toBe(true);

            expect(res.body.measurements).toHaveLength(6);
            const m = res.body.measurements[0];
            expect(m).toEqual(
                expect.objectContaining({
                    createdAt: expect.any(String),
                    value: expect.any(Number),
                    isOutlier: expect.any(Boolean),
                })
            );

            const createdAtTime = new Date(m.createdAt).getTime();
            const startDateTime = new Date(startDate).getTime();
            const endDateTime = new Date(endDate).getTime();

            expect(createdAtTime).toBeGreaterThanOrEqual(startDateTime);
            expect(createdAtTime).toBeLessThanOrEqual(endDateTime);
        })
        it("get sensor measurements with only startDate", async() =>{
            const res = await request(app)
            .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac1}/measurements`)
            .set("Authorization", `Bearer ${token}`)
            .query({ startDate });

            expect(res.status).toBe(200);

            expect(res.body).toHaveProperty("sensorMacAddress");
            expect(typeof res.body.sensorMacAddress).toBe("string");

            expect(res.body).toHaveProperty("stats");
            expect(res.body.stats).toEqual(
                expect.objectContaining({
                    mean: expect.any(Number),
                    variance: expect.any(Number),
                    upperThreshold: expect.any(Number),
                    lowerThreshold: expect.any(Number),
                    startDate: expect.any(String)
                })
            );
            expect(res.body.stats).not.toHaveProperty("endDate");

            expect(res.body).toHaveProperty("measurements");
            expect(Array.isArray(res.body.measurements)).toBe(true);
            expect(res.body.measurements).toHaveLength(7);
            const m = res.body.measurements[0];
            expect(m).toEqual(
                expect.objectContaining({
                    createdAt: expect.any(String),
                    value: expect.any(Number),
                    isOutlier: expect.any(Boolean),
                })                        
            );                    
            const createdAtTime = new Date(m.createdAt).getTime();
            const startDateTime = new Date(startDate).getTime();

            expect(createdAtTime).toBeGreaterThanOrEqual(startDateTime);
        })
        it("get sensor measurements with only endDate", async() =>{
            const res = await request(app)
            .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac1}/measurements`)
            .set("Authorization", `Bearer ${token}`)
            .query({ endDate });

            expect(res.status).toBe(200);

            expect(res.body).toHaveProperty("sensorMacAddress");
            expect(typeof res.body.sensorMacAddress).toBe("string");

            expect(res.body).toHaveProperty("stats");
            expect(res.body.stats).not.toHaveProperty("startDate");
            expect(res.body.stats).toEqual(
                expect.objectContaining({
                    mean: expect.any(Number),
                    variance: expect.any(Number),
                    upperThreshold: expect.any(Number),
                    lowerThreshold: expect.any(Number),
                    endDate: expect.any(String)
                })                    
            );            
            
            expect(res.body).toHaveProperty("measurements");
            expect(Array.isArray(res.body.measurements)).toBe(true);
            expect(res.body.measurements).toHaveLength(7);
            const m = res.body.measurements[0];
            expect(m).toEqual(
                expect.objectContaining({
                    createdAt: expect.any(String),
                    value: expect.any(Number),
                    isOutlier: expect.any(Boolean),
                })                        
            );                    
            const createdAtTime = new Date(m.createdAt).getTime();
            const endDateTime = new Date(endDate).getTime();

            expect(createdAtTime).toBeLessThanOrEqual(endDateTime)
            
        })
        it("get sensor measurements with no date", async() =>{
            const res = await request(app)
            .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac1}/measurements`)
            .set("Authorization", `Bearer ${token}`)

            expect(res.status).toBe(200);

            expect(res.body).toHaveProperty("sensorMacAddress");
            expect(typeof res.body.sensorMacAddress).toBe("string");

            expect(res.body).toHaveProperty("stats");
            expect(res.body.stats).toEqual(
                expect.objectContaining({
                    mean: expect.any(Number),
                    variance: expect.any(Number),
                    upperThreshold: expect.any(Number),
                    lowerThreshold: expect.any(Number)
                })
            );
            expect(res.body.stats).not.toHaveProperty("startDate");
            expect(res.body.stats).not.toHaveProperty("endDate");

            expect(res.body).toHaveProperty("measurements");
            expect(Array.isArray(res.body.measurements)).toBe(true);
            expect(res.body.measurements).toHaveLength(8);
            const m = res.body.measurements[0];
            expect(m).toEqual(
                expect.objectContaining({
                    createdAt: expect.any(String),
                    value: expect.any(Number) ,
                    isOutlier: expect.any(Boolean),
                })
            );
        })
        it("get sensor measurements with startDate greather than endDate", async() =>{
            const res = await request(app)
            .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac1}/measurements`)
            .set("Authorization", `Bearer ${token}`)
            .query({ startDate, endDate : lowerEndDate});

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("sensorMacAddress");
            expect(typeof res.body.sensorMacAddress).toBe("string");

            expect(res.body).toHaveProperty("stats");
            expect(res.body).not.toHaveProperty("measurements");
        })
        it("get sensor with no measurements", async() =>{
            const res = await request(app)
            .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac2}/measurements`)
            .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);

            expect(res.body).toHaveProperty("sensorMacAddress");
            expect(typeof res.body.sensorMacAddress).toBe("string");

            expect(res.body).toHaveProperty("stats");
            expect(res.body).not.toHaveProperty("measurements");
        })
    }) 
    describe("GET /networks/{networkCode}/gateways/{gatewayMac}/sensors/{sensorMac}/stats", () =>{

        it("get sensor stats", async() =>{
            const res = await request(app)
            .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac1}/stats`)
            .set("Authorization", `Bearer ${token}`)
            .query({ startDate, endDate});
    
            expect(res.status).toBe(200);
    
            expect(res.body).toEqual(
                expect.objectContaining({
                    mean: expect.any(Number),
                    variance: expect.any(Number),
                    upperThreshold: expect.any(Number),
                    lowerThreshold: expect.any(Number),
                    startDate: expect.any(String),
                    endDate: expect.any(String),
                })
            );
        })
        it("get sensor stats with no measurements", async() =>{
            const res = await request(app)
            .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac2}/stats`)
            .set("Authorization", `Bearer ${token}`)
    
            expect(res.status).toBe(200);

            expect(res.body).toEqual(
                expect.objectContaining({
                    mean: 0,
                    variance: 0,
                    upperThreshold: 0,
                    lowerThreshold: 0
                })
            );
        })
        it("get sensor stats for a no exisitng network", async() =>{
            const res = await request(app)
            .get(`/api/v1/networks/ghost/gateways/${gatewayMac}/sensors/${sensorMac1}/stats`)
            .set("Authorization", `Bearer ${token}`)
    
            expect(res.status).toBe(404);           
        })
    })
    describe("GET /networks/{networkCode}/gateways/{gatewayMac}/sensors/{sensorMac}/outliers", () =>{
    
        it("get sensor outliers", async() =>{
            const res = await request(app)
            .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac1}/outliers`)
            .set("Authorization", `Bearer ${token}`)

            expect(res.status).toBe(200);

            expect(res.body).toHaveProperty("sensorMacAddress");
            expect(typeof res.body.sensorMacAddress).toBe("string");

            expect(res.body.stats).toEqual(
                expect.objectContaining({
                    mean: expect.any(Number),
                    variance: expect.any(Number),
                    upperThreshold: expect.any(Number),
                    lowerThreshold: expect.any(Number)
                })
            );

            expect(Array.isArray(res.body.measurements)).toBe(true);
            expect(res.body.measurements).toHaveLength(1);
            const m = res.body.measurements[0];
                expect(m).toEqual(
                    expect.objectContaining({
                        createdAt: "2025-01-18T15:10:00.000Z",
                        value: 24.9,
                        isOutlier: true,
                    })
                );
        })
        it("get sensor outliers with no measurements", async() =>{
            const res = await request(app)
            .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac2}/outliers`)
            .set("Authorization", `Bearer ${token}`)

            expect(res.status).toBe(200);

            expect(res.body).toHaveProperty("sensorMacAddress");
            expect(typeof res.body.sensorMacAddress).toBe("string");

            expect(res.body).toHaveProperty("stats");
            expect(res.body).not.toHaveProperty("measurements");
        })
        it("get sensor outliers for a no exisitng network", async() =>{
            const res = await request(app)
            .get(`/api/v1/networks/ghost/gateways/${gatewayMac}/sensors/${sensorMac2}/outliers`)
            .set("Authorization", `Bearer ${token}`)

            expect(res.status).toBe(404);
        })
    })
});