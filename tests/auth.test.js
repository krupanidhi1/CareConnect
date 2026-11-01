const { app, request, connectDB, clearDB, createUser, captureOtp } = require("./helpers");

let donorToken;

beforeAll(async () => {
  await connectDB();
});
beforeEach(async () => {
  await clearDB();
  ({ token: donorToken } = await createUser({ email: "donor@test.com", role: "donor", fullName: "Donor One" }));
});

describe("Auth", () => {
  test("register → verify email → login", async () => {
    const lines = [];
    const original = console.log;
    console.log = (...a) => lines.push(a.map(String).join(" "));
    try {
      await request(app).post("/api/auth/register").send({ email: "new@test.com", password: "Password123" }).expect(201);
    } finally {
      console.log = original;
    }
    const code = lines.join("\n").match(/is (\d{6})/)[1];

    // wrong code rejected
    await request(app).post("/api/auth/verify-email").send({ email: "new@test.com", otp: "000000" }).expect(400);

    // correct code accepted and returns a token
    const verify = await request(app).post("/api/auth/verify-email").send({ email: "new@test.com", otp: code }).expect(200);
    expect(verify.body.accessToken).toBeTruthy();
    expect(verify.body.user.email).toBe("new@test.com");

    // login works after verification
    const loginRes = await request(app).post("/api/auth/login").send({ email: "new@test.com", password: "Password123" }).expect(200);
    expect(loginRes.body.accessToken).toBeTruthy();
  });

  test("unverified login is rejected", async () => {
    await request(app).post("/api/auth/register").send({ email: "u2@test.com", password: "Password123" }).expect(201);
    await request(app).post("/api/auth/login").send({ email: "u2@test.com", password: "Password123" }).expect(403);
  });

  test("role guard blocks donors from organisation-only routes", async () => {
    await request(app).post("/api/requirements").set("Authorization", `Bearer ${donorToken}`).send({ title: "x" }).expect(403);
  });

  test("me returns the public user with careconnect role", async () => {
    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${donorToken}`).expect(200);
    expect(res.body.careconnect_role || res.body.careconnectRole).toBe("donor");
    expect(res.body.passwordHash).toBeUndefined();
  });

  test("refresh issues a new access token via the cookie", async () => {
    const agent = request(app);
    const code = await captureOtp(async () => {
      await agent.post("/api/auth/register").send({ email: "rf@test.com", password: "Password123" }).expect(201);
    });
    const verify = await agent.post("/api/auth/verify-email").send({ email: "rf@test.com", otp: code }).expect(200);
    const cookie = verify.headers["set-cookie"][0].split(";")[0];

    const refreshRes = await agent.post("/api/auth/refresh").set("Cookie", cookie).expect(200);
    expect(refreshRes.body.accessToken).toBeTruthy();
    // The old refresh cookie is invalid after rotation.
    await agent.post("/api/auth/refresh").set("Cookie", cookie).expect(401);
    const rotatedCookie = refreshRes.headers["set-cookie"][0].split(";")[0];
    await agent.post("/api/auth/logout").set("Cookie", rotatedCookie).expect(200);
    await agent.post("/api/auth/refresh").set("Cookie", rotatedCookie).expect(401);
  });

  test("forgot + reset password flow", async () => {
    await createUser({ email: "reset@test.com", role: "donor", fullName: "Reset" });
    const lines = [];
    const orig = console.log;
    console.log = (...a) => lines.push(a.map(String).join(" "));
    try {
      await request(app).post("/api/auth/forgot-password").send({ email: "reset@test.com" }).expect(200);
    } finally {
      console.log = orig;
    }
    const code = lines.join("\n").match(/is (\d{6})/)[1];
    await request(app).post("/api/auth/reset-password").send({ email: "reset@test.com", token: code, newPassword: "NewPassword123" }).expect(200);
    await request(app).post("/api/auth/login").send({ email: "reset@test.com", password: "NewPassword123" }).expect(200);
  });
});