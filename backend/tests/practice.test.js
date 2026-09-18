describe("Practice confidence ordering", () => {
  test("lower confidence should come first", () => {
    const cards = [
      {
        id: "f1",
        confidence: 5,
        attempts: 1,
      },
      {
        id: "f2",
        confidence: 2,
        attempts: 1,
      },
      {
        id: "f3",
        confidence: 1,
        attempts: 1,
      },
      {
        id: "f4",
        confidence: null,
        attempts: 0,
      },
    ];

    cards.sort((a, b) => {
      if (
        a.confidence === null &&
        b.confidence !== null
      ) {
        return -1;
      }

      if (
        a.confidence !== null &&
        b.confidence === null
      ) {
        return 1;
      }

      if (a.confidence !== b.confidence) {
        return (
          (a.confidence ?? 0) -
          (b.confidence ?? 0)
        );
      }

      return a.attempts - b.attempts;
    });

    expect(
      cards.map((card) => card.id)
    ).toEqual([
      "f4",
      "f3",
      "f2",
      "f1",
    ]);
  });
});