const { request, app } = require("./setup");

describe("API contract errors", () => {
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
