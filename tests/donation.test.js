const { app, request, connectDB, clearDB, createUser } = require("./helpers");
const Organization = require("../backend/src/models/Organization");

let donorToken, orgToken, orgUser;

beforeAll(async () => {
  await connectDB();
});
beforeEach(async () => {
  await clearDB();
  ({ token: donorToken } = await createUser({ email: "donor@test.com", role: "donor", fullName: "Donor One" }));
  ({ token: orgToken, user: orgUser } = await createUser({
    email: "home@test.com",
    role: "organization",
    fullName: "Sunrise Home",
    organizationName: "Sunrise Old Age Home",
  }));
  await Organization.updateOne({ ownerId: orgUser.id || orgUser._id }, { $set: { verificationStatus: "approved" } });
});

describe("Donation lifecycle", () => {
  test("organisation creates a requirement", async () => {
    const res = await request(app)
      .post("/api/requirements")
      .set("Authorization", `Bearer ${orgToken}`)
      .send({ title: "Rice 200kg", category: "Food", priority: "urgent", quantity: 200, unit: "kg" })
      .expect(201);
    expect(res.body.title).toBe("Rice 200kg");
    expect(res.body.organization.name).toBe("Sunrise Old Age Home");
  });

  test("donor donates and organisation advances status to delivered", async () => {
    const req = await request(app)
      .post("/api/requirements")
      .set("Authorization", `Bearer ${orgToken}`)
      .send({ title: "Rice 200kg", category: "Food", priority: "urgent", quantity: 200, unit: "kg" })
      .expect(201);

    const donation = await request(app)
      .post("/api/donations")
      .set("Authorization", `Bearer ${donorToken}`)
      .send({ requirement_id: req.body.id, quantity: 50, unit: "kg", type: "goods" })
      .expect(201);
    expect(donation.body.status).toBe("pending");

    const mine = await request(app).get("/api/donations/mine").set("Authorization", `Bearer ${donorToken}`).expect(200);
    expect(mine.body.items.length).toBe(1);

    const received = await request(app).get("/api/donations/received").set("Authorization", `Bearer ${orgToken}`).expect(200);
    expect(received.body.items.length).toBe(1);

    await request(app)
      .patch(`/api/donations/${donation.body.id}/status`)
      .set("Authorization", `Bearer ${orgToken}`)
      .send({ status: "confirmed" })
      .expect(200);
    await request(app)
      .patch(`/api/donations/${donation.body.id}/status`)
      .set("Authorization", `Bearer ${orgToken}`)
      .send({ status: "in_transit" })
      .expect(200);
    await request(app)
      .patch(`/api/donations/${donation.body.id}/status`)
      .set("Authorization", `Bearer ${orgToken}`)
      .send({ status: "delivered" })
      .expect(200);

    const updatedReq = await request(app).get("/api/requirements").set("Authorization", `Bearer ${orgToken}`);
    const target = updatedReq.body.items.find((r) => r.id === req.body.id);
    expect(target.fulfilledQuantity).toBeGreaterThanOrEqual(50);
  });

  test("donor cannot access admin donations list", async () => {
    await request(app).get("/api/donations").set("Authorization", `Bearer ${donorToken}`).expect(403);
  });
});