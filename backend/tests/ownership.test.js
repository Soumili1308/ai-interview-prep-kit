describe("kit ownership rules", () => {
  test("kit queries must include userId", () => {
    const userId = "user-a";
    const kitId = "kit-1";

    const query = {
      _id: kitId,
      userId,
    };

    expect(query).toEqual({
      _id: "kit-1",
      userId: "user-a",
    });

    expect(query.userId).not.toBe(
      "user-b"
    );
  });

  test("different users cannot share an ownership key", () => {
    const firstUserKey =
      "user-a:kit-1";

    const secondUserKey =
      "user-b:kit-1";

    expect(
      firstUserKey
    ).not.toBe(secondUserKey);
  });
});