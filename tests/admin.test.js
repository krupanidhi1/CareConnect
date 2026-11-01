const { app, request, connectDB, clearDB, createUser, makeAdmin } = require("./helpers");

let orgToken;

beforeAll(async () => {
  await connectDB();
});
beforeEach(async () => {
  await clearDB();
  await createUser({ email: "donor@test.com", role: "donor", fullName: "Donor One" });
  ({ token: orgToken } = await createUser({
    email: "home@test.com",
    role: "organization",
    fullName: "Sunrise Home",
    organizationName: "Sunrise Old Age Home",
  }));
});

// helper override: makeAdmin in helpers logs in but admin user must exist first
async function adminLogin() {
  await createUser({ email: "admin@test.com", role: "donor", fullName: "Admin" });
  return makeAdmin("admin@test.com");
}

describe("Admin", () => {
  test("stats counts users and organisations", async () => {
    const token = await adminLogin();
    const res = await request(app).get("/api/admin/stats").set("Authorization", `Bearer ${token}`).expect(200);
    expect(res.body.totalUsers).toBeGreaterThanOrEqual(3);
    expect(res.body.organizations).toBeGreaterThanOrEqual(1);
  });

  test("non-admin cannot access admin stats", async () => {
    await request(app).get("/api/admin/stats").set("Authorization", `Bearer ${orgToken}`).expect(403);
  });

  test("review organization approves a pending home", async () => {
    const token = await adminLogin();
    const orgs = await request(app).get("/api/admin/organizations").set("Authorization", `Bearer ${token}`).expect(200);
    const target = orgs.body.items.find((o) => o.name === "Sunrise Old Age Home");
    const res = await request(app)
      .patch(`/api/admin/organizations/${target.id}/review`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "approved" })
      .expect(200);
    expect(res.body.verificationStatus).toBe("approved");
  });

  test("CSV export returns text/csv", async () => {
    const token = await adminLogin();
    const res = await request(app).get("/api/admin/reports/donations.csv").set("Authorization", `Bearer ${token}`).expect(200);
    expect(res.headers["content-type"]).toContain("text/csv");
    expect(res.text.split("\n")[0]).toContain("Donor");
  });
});