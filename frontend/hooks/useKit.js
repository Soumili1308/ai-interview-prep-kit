"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import api from "../lib/api";

export function useKit(id) {
  const [kit, setKit] =
    useState(null);
  const [editorState, setEditorState] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  const loadKit = useCallback(
    async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            `/kits/${id}`
          );

        setKit(response.data?.kit || null);
        setEditorState(
          response.data?.editorState ||
            null
        );
      } catch (err) {
        setError(
          err.message ||
            "Unable to load the kit."
        );
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    loadKit();
  }, [loadKit]);

  function updateFromResponse(
    response
  ) {
    if (response.data?.kit) {
      setKit(response.data.kit);
    }

    if (
      response.data?.editorState
    ) {
      setEditorState(
        response.data.editorState
      );
    }
  }

  async function updateQuestion(
    questionId,
    data
  ) {
    const response =
      await api.patch(
        `/kits/${id}/questions/${questionId}`,
        data
      );

    updateFromResponse(response);
    return response;
  }

  async function updateFlashcard(
    flashcardId,
    data
  ) {
    const response =
      await api.patch(
        `/kits/${id}/flashcards/${flashcardId}`,
        data
      );

    updateFromResponse(response);
    return response;
  }

  async function updateBrief(data) {
    const response =
      await api.patch(
        `/kits/${id}/company-brief`,
        data
      );

    updateFromResponse(response);
    return response;
  }

  async function reorderQuestions(
    questionIds
  ) {
    const response =
      await api.patch(
        `/kits/${id}/questions/reorder`,
        { question_ids: questionIds }
      );

    updateFromResponse(response);
    return response;
  }

  async function pinQuestion(
    questionId,
    pinned
  ) {
    const response =
      await api.patch(
        `/kits/${id}/questions/${questionId}/pin`,
        { pinned }
      );

    updateFromResponse(response);
    return response;
  }

  async function pinFlashcard(
    flashcardId,
    pinned
  ) {
    const response =
      await api.patch(
        `/kits/${id}/flashcards/${flashcardId}/pin`,
        { pinned }
      );

    updateFromResponse(response);
    return response;
  }

  async function addQuestion(data) {
    const response =
      await api.post(
        `/kits/${id}/questions`,
        data
      );

    updateFromResponse(response);
    return response;
  }

  async function deleteQuestion(
    questionId
  ) {
    const response =
      await api.delete(
        `/kits/${id}/questions/${questionId}`
      );

    updateFromResponse(response);
    return response;
  }

  async function addFlashcard(data) {
    const response =
      await api.post(
        `/kits/${id}/flashcards`,
        data
      );

    updateFromResponse(response);
    return response;
  }

  async function deleteFlashcard(
    flashcardId
  ) {
    const response =
      await api.delete(
        `/kits/${id}/flashcards/${flashcardId}`
      );

    updateFromResponse(response);
    return response;
  }

  async function regenerateSchedule() {
    const response =
      await api.post(
        `/kits/${id}/regenerate/schedule`,
        {}
      );

    updateFromResponse(response);
    return response;
  }

  return {
    kit,
    editorState,
    loading,
    error,
    reload: loadKit,
    updateQuestion,
    updateFlashcard,
    updateBrief,
    reorderQuestions,
    pinQuestion,
    pinFlashcard,
    addQuestion,
    deleteQuestion,
    addFlashcard,
    deleteFlashcard,
    regenerateSchedule,
  };
}