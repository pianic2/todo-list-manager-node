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
  });
});
