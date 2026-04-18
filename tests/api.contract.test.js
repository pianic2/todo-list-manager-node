const { request, app } = require("./setup");

describe("API contract errors", () => {
  test("CORS allows configured test origin", async () => {
    const response = await request(app).get("/").set("Origin", "http://example.test");

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe("*");
  });

  test("malformed JSON returns a validation error", async () => {
    const response = await request(app)
      .post("/lists")
      .set("Content-Type", "application/json")
      .send("{ malformed");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: "validation error",
    });
  });
});
