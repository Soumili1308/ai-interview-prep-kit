"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { useKit } from "../../../../hooks/useKit";
import LoadingState from "../../../../components/LoadingState";
import ErrorState from "../../../../components/ErrorState";

import QuestionEditor from "../../../../components/kit/QuestionEditor";
import FlashcardEditor from "../../../../components/kit/FlashcardEditor";
import CompanyBriefEditor from "../../../../components/kit/CompanyBriefEditor";
import AddQuestionForm from "../../../../components/kit/AddQuestionForm";
import AddFlashcardForm from "../../../../components/kit/AddFlashcardForm";
import RegenerationPanel from "../../../../components/kit/RegenerationPanel";
import QuestionReorderControls from "../../../../components/kit/QuestionReorderControls";

export default function KitEditorPage() {
  const params = useParams();

  const {
    kit,
    editorState,
    loading,
    error,
    reload,
    updateQuestion,
    updateFlashcard,
    updateBrief,
    pinQuestion,
    pinFlashcard,
    addQuestion,
    deleteQuestion,
    addFlashcard,
    deleteFlashcard,
    reorderQuestions,
  } = useKit(params.id);

  if (loading) {
    return (
      <LoadingState message="Loading your interview kit..." />
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={reload}
      />
    );
  }

  if (!kit) {
    return (
      <ErrorState message="Interview kit not found." />
    );
  }

  const uncovered =
    kit.coverage?.uncovered_requirement_ids || [];

  const questions = kit.questions || [];
  const flashcards = kit.flashcards || [];

  return (
    <div className="space-y-8">
      {/* Header */}

      <div>
        <Link
          href="/kits"
          className="mb-5 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to kits
        </Link>

        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-medium text-slate-400">
              {kit.source?.company}
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              {kit.source?.role}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {kit.source?.location ||
                "Location not specified"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/kits/${params.id}/practice`}
              className="secondary-button"
            >
              <BookOpen size={16} />
              Practice
            </Link>

            <Link
              href={`/kits/${params.id}/schedule`}
              className="secondary-button"
            >
              <CalendarDays size={16} />
              Schedule
            </Link>
          </div>
        </div>
      </div>

      {/* Coverage */}

      <CoverageBanner
        uncovered={uncovered}
        requirements={kit.role?.requirements || []}
      />

      {/* Regeneration */}

      <RegenerationPanel
        kitId={params.id}
        onUpdated={() => reload()}
      />

      {/* Company brief */}

      <CompanyBriefEditor
        brief={kit.company_brief}
        editorMeta={editorState?.companyBrief}
        onSave={updateBrief}
      />

      {/* Questions */}

      <section>
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Interview questions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Edit, reorder, categorize, pin, add or
              delete questions.
            </p>
          </div>

          <AddQuestionForm
            onAdd={addQuestion}
            requirements={
              kit.role?.requirements || []
            }
          />
        </div>

        <div className="space-y-5">
          {questions.map((question, index) => (
            <div key={question.id} className="space-y-2">
              <div className="flex justify-end">
                <QuestionReorderControls
                  index={index}
                  total={questions.length}
                  onMove={async (from, to) => {
                    const next = [...questions];
                    const [moved] = next.splice(from, 1);
                    next.splice(to, 0, moved);
                    await reorderQuestions(next.map((item) => item.id));
                  }}
                />
              </div>
              <QuestionEditor
              question={question}
              editorMeta={
                editorState?.questions?.[
                  question.id
                ]
              }
              onSave={updateQuestion}
              onDelete={async (id) => {
                if (
                  window.confirm(
                    "Delete this question?"
                  )
                ) {
                  await deleteQuestion(id);
                }
              }}
              onPin={pinQuestion}
            />
            </div>
          ))}
        </div>
      </section>

      {/* Flashcards */}

      <section>
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Flashcards
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Edit your study cards or add your own.
            </p>
          </div>

          <AddFlashcardForm
            onAdd={addFlashcard}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {flashcards.map((flashcard) => (
            <FlashcardEditor
              key={flashcard.id}
              flashcard={flashcard}
              editorMeta={
                editorState?.flashcards?.[
                  flashcard.id
                ]
              }
              onSave={updateFlashcard}
              onDelete={async (id) => {
                if (
                  window.confirm(
                    "Delete this flashcard?"
                  )
                ) {
                  await deleteFlashcard(id);
                }
              }}
              onPin={pinFlashcard}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function CoverageBanner({
  uncovered,
  requirements,
}) {
  if (uncovered.length === 0) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <CheckCircle2
          size={20}
          className="mt-0.5 shrink-0 text-emerald-600"
        />

        <div>
          <p className="font-medium text-emerald-900">
            All requirements are covered
          </p>

          <p className="mt-1 text-sm text-emerald-700">
            {requirements.length} requirements are
            currently represented in the question set.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <AlertTriangle
        size={20}
        className="mt-0.5 shrink-0 text-amber-600"
      />

      <div>
        <p className="font-medium text-amber-900">
          {uncovered.length} requirement
          {uncovered.length === 1 ? "" : "s"} not
          covered
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          {uncovered.map((id) => (
            <span
              key={id}
              className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-amber-800"
            >
              {id}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}