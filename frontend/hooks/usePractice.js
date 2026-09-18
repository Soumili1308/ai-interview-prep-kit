"use client";

import { useCallback, useEffect, useState } from "react";

import api from "../lib/api";

export function usePractice(kitId) {
  const [cards, setCards] = useState([]);
  const [covered, setCovered] = useState(0);
  const [uncovered, setUncovered] =
    useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPractice = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/kits/${kitId}/practice`
        );

        setCards(response.data?.flashcards || response.flashcards || []);
        setCovered(response.data?.covered ?? response.covered ?? 0);
        setUncovered(
          response.data?.uncovered ?? response.uncovered ?? 0
        );
      } catch (err) {
        setError(
          err.message ||
            "Unable to load practice mode."
        );
      } finally {
        setLoading(false);
      }
    },
    [kitId]
  );

  useEffect(() => {
    if (kitId) {
      loadPractice();
    }
  }, [kitId, loadPractice]);

  async function recordConfidence(
    flashcardId,
    confidence
  ) {
    const response = await api.post(
      `/kits/${kitId}/practice/${flashcardId}/confidence`,
      {
        confidence,
      }
    );

    setCards(response.data?.flashcards || response.flashcards || []);
    setCovered(response.data?.covered ?? response.covered ?? 0);
    setUncovered(
      response.data?.uncovered ?? response.uncovered ?? 0
    );

    return response;
  }

  return {
    cards,
    covered,
    uncovered,
    loading,
    error,
    reload: loadPractice,
    recordConfidence,
  };
}