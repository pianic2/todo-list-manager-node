const { request, app } = require("./setup");

describe("Items API", () => {
  test("CRUD flow for items works correctly", async () => {
    const listResponse = await request(app).post("/lists").send({
      title: "List for items",
      description: "Container",
    });

    expect(listResponse.status).toBe(201);
    const listId = listResponse.body.data.id;

    const firstItemResponse = await request(app)
      .post(`/lists/${listId}/items`)
      .send({ text: "First item", status: "todo" });

    expect(firstItemResponse.status).toBe(201);
    expect(firstItemResponse.body.success).toBe(true);
    expect(firstItemResponse.body.data).toHaveProperty("id");

    const secondItemResponse = await request(app)
      .post(`/lists/${listId}/items`)
      .send({ text: "Second item" });

    expect(secondItemResponse.status).toBe(201);

    const getItemsResponse = await request(app).get(`/lists/${listId}/items`);
    expect(getItemsResponse.status).toBe(200);
    expect(getItemsResponse.body.success).toBe(true);
    expect(Array.isArray(getItemsResponse.body.data)).toBe(true);
    expect(getItemsResponse.body.data.length).toBe(2);

    const itemId = firstItemResponse.body.data.id;

    const updateResponse = await request(app)
      .put(`/lists/${listId}/items/${itemId}`)
      .send({ text: "First item updated" });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.success).toBe(true);
    expect(updateResponse.body.data.text).toBe("First item updated");

    const changeStatusResponse = await request(app)
      .patch(`/lists/${listId}/items/${itemId}/status`)
      .send({ status: "done" });

    expect(changeStatusResponse.status).toBe(200);
    expect(changeStatusResponse.body.success).toBe(true);
    expect(changeStatusResponse.body.data.status).toBe("done");

    const deleteResponse = await request(app).delete(`/lists/${listId}/items/${itemId}`);
    expect(deleteResponse.status).toBe(204);

    const getItemResponse = await request(app).get(`/lists/${listId}/items/${itemId}`);
    expect(getItemResponse.status).toBe(404);

    const getVisibleItemsResponse = await request(app).get(`/lists/${listId}/items`);
    expect(getVisibleItemsResponse.status).toBe(200);
    expect(getVisibleItemsResponse.body.success).toBe(true);
    expect(getVisibleItemsResponse.body.data.length).toBe(1);
    expect(getVisibleItemsResponse.body.data[0].id).toBe(secondItemResponse.body.data.id);
  });

  test("item operations are scoped to their parent list", async () => {
    const firstListResponse = await request(app).post("/lists").send({
      title: "First list",
      description: "Owns the item",
    });
    const secondListResponse = await request(app).post("/lists").send({
      title: "Second list",
      description: "Must not access it",
    });

    expect(firstListResponse.status).toBe(201);
    expect(secondListResponse.status).toBe(201);

    const firstListId = firstListResponse.body.data.id;
    const secondListId = secondListResponse.body.data.id;

    const createResponse = await request(app)
      .post(`/lists/${firstListId}/items`)
      .send({ text: "Scoped item", status: "todo" });

    expect(createResponse.status).toBe(201);
    const itemId = createResponse.body.data.id;

    const correctListResponse = await request(app).get(`/lists/${firstListId}/items/${itemId}`);
    expect(correctListResponse.status).toBe(200);
    expect(correctListResponse.body.data.id).toBe(itemId);
    expect(correctListResponse.body.data.list_id).toBe(firstListId);

    const wrongListRead = await request(app).get(`/lists/${secondListId}/items/${itemId}`);
    expect(wrongListRead.status).toBe(404);

    const wrongListUpdate = await request(app)
      .put(`/lists/${secondListId}/items/${itemId}`)
      .send({ text: "Cross-list update" });
    expect(wrongListUpdate.status).toBe(404);

    const wrongListStatus = await request(app)
      .patch(`/lists/${secondListId}/items/${itemId}/status`)
      .send({ status: "done" });
    expect(wrongListStatus.status).toBe(404);

    const wrongListDelete = await request(app).delete(`/lists/${secondListId}/items/${itemId}`);
    expect(wrongListDelete.status).toBe(404);

    const finalReadResponse = await request(app).get(`/lists/${firstListId}/items/${itemId}`);
    expect(finalReadResponse.status).toBe(200);
    expect(finalReadResponse.body.data.text).toBe("Scoped item");
    expect(finalReadResponse.body.data.status).toBe("todo");
  });

  test("POST /lists/:listId/items rejects missing parent lists", async () => {
    const response = await request(app)
      .post("/lists/999999/items")
      .send({ text: "Orphan item", status: "todo" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      error: "List not found",
    });
  });

  test("PUT /lists/:listId/items/:itemId rejects invalid update payloads", async () => {
    const listResponse = await request(app).post("/lists").send({
      title: "List for invalid item update",
      description: "Container",
    });
    const listId = listResponse.body.data.id;

    const itemResponse = await request(app)
      .post(`/lists/${listId}/items`)
      .send({ text: "Original text", status: "todo" });
    const itemId = itemResponse.body.data.id;

    const response = await request(app).put(`/lists/${listId}/items/${itemId}`).send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: "validation error",
    });

    const finalReadResponse = await request(app).get(`/lists/${listId}/items/${itemId}`);
    expect(finalReadResponse.status).toBe(200);
    expect(finalReadResponse.body.data.text).toBe("Original text");
  });

  test("PATCH /lists/:listId/items/:itemId/status rejects invalid status", async () => {
    const listResponse = await request(app).post("/lists").send({
      title: "List for invalid status",
      description: "Container",
    });
    const listId = listResponse.body.data.id;

    const itemResponse = await request(app)
      .post(`/lists/${listId}/items`)
      .send({ text: "Status target", status: "todo" });
    const itemId = itemResponse.body.data.id;

    const response = await request(app)
      .patch(`/lists/${listId}/items/${itemId}/status`)
      .send({ status: "blocked" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: "validation error",
    });
  });

  test("item routes reject invalid ids", async () => {
    const updateResponse = await request(app)
      .put("/lists/abc/items/1")
      .send({ text: "Valid text" });

    expect(updateResponse.status).toBe(400);
    expect(updateResponse.body).toEqual({
      success: false,
      error: "validation error",
    });

    const statusResponse = await request(app)
      .patch("/lists/1/items/xyz/status")
      .send({ status: "done" });

    expect(statusResponse.status).toBe(400);
    expect(statusResponse.body).toEqual({
      success: false,
      error: "validation error",
    });
  });
});
