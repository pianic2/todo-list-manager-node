const errorHandler = require("../src/middleware/error.middleware");

function createMockResponse() {
  return {
    statusCode: undefined,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

describe("error handler", () => {
  test("does not expose internal error messages", () => {
    const response = createMockResponse();
    const error = new Error("SQLITE_CONSTRAINT_FOREIGNKEY: internal detail");

    jest.spyOn(console, "error").mockImplementation(() => {});

    try {
      errorHandler(error, {}, response, () => {});
    } finally {
      console.error.mockRestore();
    }

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({
      success: false,
      error: "internal server error",
    });
  });

  test("keeps malformed JSON on the stable validation contract", () => {
    const response = createMockResponse();
    const error = new SyntaxError("Unexpected token");
    error.status = 400;
    error.body = "{ malformed";

    errorHandler(error, {}, response, () => {});

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: "validation error",
    });
  });
});
