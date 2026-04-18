const { request, app } = require("./setup");

describe("Lists API", () => {
  test("POST /lists creates a list", async () => {
    const response = await request(app).post("/lists").send({
      title: "Groceries",
      description: "Weekly shopping",
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty("id");
    expect(response.body.data.title).toBe("Groceries");
  });

  test("GET /lists returns an array", async () => {
    await request(app).post("/lists").send({ title: "Work", description: "Tasks" });

    const response = await request(app).get("/lists");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test("GET /lists/:id returns the correct list", async () => {
    const created = await request(app).post("/lists").send({
      title: "Personal",
      description: "Private tasks",
    });

    const listId = created.body.data.id;
    const response = await request(app).get(`/lists/${listId}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(listId);
    expect(response.body.data.title).toBe("Personal");
  });

  test("PUT /lists/:id updates a list", async () => {
    const created = await request(app).post("/lists").send({
      title: "Old title",
      description: "Old description",
    });

    const listId = created.body.data.id;
    const response = await request(app).put(`/lists/${listId}`).send({
      title: "New title",
      description: "New description",
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe("New title");
    expect(response.body.data.description).toBe("New description");
  });

  test("PUT /lists/:id rejects invalid update payloads", async () => {
    const created = await request(app).post("/lists").send({
      title: "Valid title",
      description: "Valid description",
    });

    const listId = created.body.data.id;
    const response = await request(app).put(`/lists/${listId}`).send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: "validation error",
    });
  });

  test("list routes reject invalid ids", async () => {
    const response = await request(app).put("/lists/not-a-number").send({
      title: "New title",
      description: "New description",
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: "validation error",
    });
  });

  test("DELETE /lists/:id hides a list from users", async () => {
    const created = await request(app).post("/lists").send({
      title: "To delete",
      description: "Temporary",
    });

    const listId = created.body.data.id;

    await request(app)
      .post(`/lists/${listId}/items`)
      .send({ text: "Hidden with list", status: "todo" });

    const deleteResponse = await request(app).delete(`/lists/${listId}`);

    expect(deleteResponse.status).toBe(204);

    const getResponse = await request(app).get(`/lists/${listId}`);
    expect(getResponse.status).toBe(404);

    const allListsResponse = await request(app).get("/lists");
    expect(allListsResponse.status).toBe(200);
    expect(allListsResponse.body.data.some((list) => list.id === listId)).toBe(false);

    const itemsResponse = await request(app).get(`/lists/${listId}/items`);
    expect(itemsResponse.status).toBe(200);
    expect(itemsResponse.body.data).toEqual([]);
  });
});
