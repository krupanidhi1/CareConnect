const { app, request, connectDB, clearDB, createUser } = require("./helpers");
const Organization = require("../backend/src/models/Organization");

let volunteerToken, orgToken;

beforeAll(async () => {
  await connectDB();
});
beforeEach(async () => {
  await clearDB();
  ({ token: volunteerToken } = await createUser({ email: "vol@test.com", role: "volunteer", fullName: "Aarav Sharma" }));
  const orgAccount = await createUser({
    email: "home@test.com",
    role: "organization",
    fullName: "Sunrise Home",
    organizationName: "Sunrise Old Age Home",
  });
  orgToken = orgAccount.token;
  await Organization.updateOne({ ownerId: orgAccount.user.id || orgAccount.user._id }, { $set: { verificationStatus: "approved" } });
});

describe("Volunteer workflow", () => {
  test("org posts opportunity, volunteer applies, org accepts", async () => {
    const opp = await request(app)
      .post("/api/opportunities")
      .set("Authorization", `Bearer ${orgToken}`)
      .send({ title: "Saturday visits", description: "Companionship", location: "Hyderabad", date: "2026-12-01", slots: 10 })
      .expect(201);

    const app1 = await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${volunteerToken}`)
      .send({ opportunity_id: opp.body.id, message: "I'd love to help." })
      .expect(201);
    expect(app1.body.status).toBe("pending");

    const mine = await request(app).get("/api/applications/mine").set("Authorization", `Bearer ${volunteerToken}`).expect(200);
    expect(mine.body.items.length).toBe(1);

    const received = await request(app).get("/api/applications/received").set("Authorization", `Bearer ${orgToken}`).expect(200);
    expect(received.body.items.length).toBe(1);

    await request(app)
      .patch(`/api/applications/${app1.body.id}/status`)
      .set("Authorization", `Bearer ${orgToken}`)
      .send({ status: "accepted" })
      .expect(200);

    const updated = await request(app).get("/api/applications/mine").set("Authorization", `Bearer ${volunteerToken}`).expect(200);
    expect(updated.body.items[0].status).toBe("accepted");
  });

  test("volunteer cannot create opportunities", async () => {
    await request(app).post("/api/opportunities").set("Authorization", `Bearer ${volunteerToken}`).send({ title: "x" }).expect(403);
  });
});