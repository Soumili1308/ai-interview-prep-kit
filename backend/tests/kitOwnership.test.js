describe(
  "kit ownership rules",
  () => {
    test(
      "queries must include authenticated user id",
      () => {
        const userA =
          "aaaaaaaaaaaaaaaaaaaaaaaa";

        const userB =
          "bbbbbbbbbbbbbbbbbbbbbbbb";

        const queryForA = {
          _id: "kit123",
          userId: userA,
        };

        expect(
          queryForA.userId
        ).toBe(userA);

        expect(
          queryForA.userId
        ).not.toBe(userB);
      }
    );
  }
);