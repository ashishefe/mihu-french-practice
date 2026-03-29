"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listeningStrategies,
  pedagogyNotes,
  practiceQuestions,
  reviewCards,
  sourceFiles,
  stages
} from "@/lib/mihika-data";

type ReviewProgress = {
  ease: number;
  dueAt: string;
  lastSeen: string | null;
};

type QuestionProgress = {
  correct: number;
  wrong: number;
};

type SaveState = {
  health: number;
  lives: number;
  streak: number;
  xp: number;
  completedWriting: boolean;
  review: Record<string, ReviewProgress>;
  questions: Record<string, QuestionProgress>;
};

const STORAGE_KEY = "mihika-french-quest-progress";
const REVIEW_INTERVALS_IN_DAYS = [0, 1, 3, 7, 14];
const WRITING_FIELDS = [
  {
    id: "where",
    question: "Où es-tu allé(e) ?",
    placeholder: "Je suis allé(e) au musée / au parc / au restaurant..."
  },
  {
    id: "withWhom",
    question: "Avec qui es-tu allé(e) ?",
    placeholder: "J'y suis allé(e) avec ma famille / mes amis..."
  },
  {
    id: "activities",
    question: "Qu'est-ce que tu as fait là-bas ?",
    placeholder: "Nous avons regardé..., j'ai joué..., j'ai acheté..."
  },
  {
    id: "clothes",
    question: "Qu'est-ce que tu as porté ?",
    placeholder: "J'ai porté une robe bleue / un t-shirt noir..."
  },
  {
    id: "food",
    question: "Qu'est-ce que tu as mangé ? As-tu aimé la nourriture ? Pourquoi ?",
    placeholder: "J'ai mangé... J'ai aimé / je n'ai pas aimé... parce que..."
  }
] as const;

const defaultState: SaveState = {
  health: 86,
  lives: 4,
  streak: 0,
  xp: 0,
  completedWriting: false,
  review: Object.fromEntries(
    reviewCards.map((card) => [
      card.id,
      {
        ease: 0,
        dueAt: new Date().toISOString(),
        lastSeen: null
      }
    ])
  ),
  questions: Object.fromEntries(
    practiceQuestions.map((question) => [
      question.id,
      {
        correct: 0,
        wrong: 0
      }
    ])
  )
};

function normalizeText(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim();
}

function sameAnswer(input: string, expected: string) {
  const cleanedInput = normalizeText(input);
  const cleanedExpected = normalizeText(expected);

  return cleanedInput === cleanedExpected;
}

function containsKeywords(input: string, keywords: string[]) {
  const normalizedInput = normalizeText(input);

  return keywords.every((keyword) => normalizedInput.includes(normalizeText(keyword)));
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short"
  }).format(new Date(value));
}

export default function Home() {
  const [saveState, setSaveState] = useState<SaveState>(defaultState);
  const [mounted, setMounted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [textAnswer, setTextAnswer] = useState("");
  const [questionAttempts, setQuestionAttempts] = useState(0);
  const [questionFeedback, setQuestionFeedback] = useState<{
    tone: "idle" | "correct" | "wrong";
    message: string;
  }>({ tone: "idle", message: "Warm up with one careful answer." });
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewInput, setReviewInput] = useState("");
  const [reviewRevealed, setReviewRevealed] = useState(false);
  const [reviewResolved, setReviewResolved] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState("Ready for a quick memory check.");
  const [writingAnswers, setWritingAnswers] = useState<Record<string, string>>(
    Object.fromEntries(WRITING_FIELDS.map((field) => [field.id, ""]))
  );
  const [writingFeedback, setWritingFeedback] = useState<{
    tone: "idle" | "correct" | "wrong";
    message: string;
  }>({
    tone: "idle",
    message: "Write each part first. Rewards only unlock after the full response is there."
  });

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as SaveState;
        setSaveState({
          ...defaultState,
          ...parsed,
          review: {
            ...defaultState.review,
            ...parsed.review
          },
          questions: {
            ...defaultState.questions,
            ...parsed.questions
          }
        });
      } catch {
        setSaveState(defaultState);
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saveState));
  }, [mounted, saveState]);

  const currentQuestion = practiceQuestions[questionIndex % practiceQuestions.length];

  const dueReviewCards = useMemo(() => {
    const now = Date.now();

    return reviewCards.filter((card) => {
      const progress = saveState.review[card.id];
      return new Date(progress?.dueAt ?? 0).getTime() <= now;
    });
  }, [saveState.review]);

  const currentReviewCard =
    dueReviewCards[reviewIndex % Math.max(dueReviewCards.length, 1)] ?? reviewCards[0];

  const stageCompletion = useMemo(() => {
    return stages.map((stage) => {
      const stageQuestions = practiceQuestions.filter((question) => question.stageId === stage.id);
      const mastered = stageQuestions.filter((question) => {
        const progress = saveState.questions[question.id];
        return progress && progress.correct > progress.wrong && progress.correct > 0;
      }).length;

      return {
        ...stage,
        mastered,
        total: stageQuestions.length
      };
    });
  }, [saveState.questions]);

  const totalCorrect = Object.values(saveState.questions).reduce(
    (sum, item) => sum + item.correct,
    0
  );
  const totalWrong = Object.values(saveState.questions).reduce((sum, item) => sum + item.wrong, 0);
  const masteryPercent = Math.round(
    (stageCompletion.reduce((sum, item) => sum + item.mastered, 0) /
      practiceQuestions.length) *
      100
  );

  const reviewDueCount = dueReviewCards.length;
  const nextReviewDate = Object.values(saveState.review)
    .map((item) => item.dueAt)
    .sort()[0];
  const combinedWriting = WRITING_FIELDS.map((field) => writingAnswers[field.id].trim())
    .filter(Boolean)
    .join(" ");
  const writingWordCount = combinedWriting
    ? combinedWriting.split(/\s+/).filter(Boolean).length
    : 0;
  const routeProgress = stageCompletion.map((stage) => ({
    id: stage.id,
    title: stage.title,
    complete: stage.mastered === stage.total && stage.total > 0
  }));

  function saveQuestionResult(correct: boolean) {
    setSaveState((current) => {
      const existing = current.questions[currentQuestion.id];
      const firstWin = correct && existing.correct === 0;
      const nextQuestions = {
        ...current.questions,
        [currentQuestion.id]: {
          correct: existing.correct + (correct ? 1 : 0),
          wrong: existing.wrong + (correct ? 0 : 1)
        }
      };

      const nextStreak = correct ? current.streak + 1 : 0;
      const nextLives = correct
        ? Math.min(
            5,
            current.lives + (firstWin && nextStreak > 0 && nextStreak % 4 === 0 ? 1 : 0)
          )
        : Math.max(0, current.lives - 1);
      const nextHealth = correct
        ? Math.min(100, current.health + (firstWin ? 6 : 2))
        : Math.max(0, current.health - 12);

      return {
        ...current,
        questions: nextQuestions,
        streak: nextStreak,
        lives: nextLives,
        health: nextHealth,
        xp: current.xp + (correct ? (firstWin ? 14 : 4) : 3)
      };
    });
  }

  function submitQuestion() {
    const rawAnswer =
      currentQuestion.type === "mcq" ? selectedOption : textAnswer.replace(/\s+/g, " ").trim();

    if (!rawAnswer) {
      setQuestionFeedback({
        tone: "wrong",
        message: `No guess yet. Hint: ${currentQuestion.hint}`
      });
      return;
    }

    const correct = sameAnswer(rawAnswer, currentQuestion.answer);
    saveQuestionResult(correct);
    setQuestionAttempts((value) => value + 1);

    if (correct) {
      setQuestionFeedback({
        tone: "correct",
        message: `Correct. ${currentQuestion.explanation}`
      });
    } else {
      setQuestionFeedback({
        tone: "wrong",
        message:
          questionAttempts === 0
            ? `Not yet. ${currentQuestion.hint} Try once more before the full answer is shown.`
            : `Not yet. ${currentQuestion.hint} Correct answer: ${currentQuestion.answer}.`
      });
    }
  }

  function nextQuestion() {
    if (questionFeedback.tone !== "correct") {
      setSaveState((current) => ({
        ...current,
        streak: 0,
        health: Math.max(0, current.health - 4)
      }));
    }

    setQuestionIndex((value) => (value + 1) % practiceQuestions.length);
    setSelectedOption("");
    setTextAnswer("");
    setQuestionAttempts(0);
    setQuestionFeedback({
      tone: "idle",
      message: "New prompt loaded. Say it, think it, then answer it."
    });
  }

  function recordReviewResult(success: boolean) {
    const now = new Date();

    setSaveState((current) => {
      const currentProgress = current.review[currentReviewCard.id];
      const nextEase = success
        ? Math.min(REVIEW_INTERVALS_IN_DAYS.length - 1, currentProgress.ease + 1)
        : 0;
      const interval = REVIEW_INTERVALS_IN_DAYS[nextEase];

      return {
        ...current,
        health: success ? Math.min(100, current.health + 4) : Math.max(0, current.health - 8),
        lives: success ? current.lives : Math.max(0, current.lives - 1),
        xp: current.xp + (success ? 10 : 2),
        review: {
          ...current.review,
          [currentReviewCard.id]: {
            ease: nextEase,
            lastSeen: now.toISOString(),
            dueAt: addDays(now, interval).toISOString()
          }
        }
      };
    });
  }

  function submitReviewRecall() {
    if (!reviewInput.trim()) {
      setReviewFeedback("Type the idea from memory first. No reward for instant reveal.");
      return;
    }

    if (containsKeywords(reviewInput, currentReviewCard.keywords)) {
      recordReviewResult(true);
      setReviewResolved(true);
      setReviewFeedback(
        `Locked in. This card returns on ${formatDate(
          addDays(
            new Date(),
            REVIEW_INTERVALS_IN_DAYS[
              Math.min(
                REVIEW_INTERVALS_IN_DAYS.length - 1,
                saveState.review[currentReviewCard.id].ease + 1
              )
            ]
          ).toISOString()
        )}.`
      );
      return;
    }

    setReviewRevealed(true);
    recordReviewResult(false);
    setReviewResolved(true);
    setReviewFeedback("Not secure yet. Read the answer, then move to the next review card.");
  }

  function revealReviewAnswer() {
    setReviewRevealed(true);
    recordReviewResult(false);
    setReviewResolved(true);
    setReviewFeedback("Answer revealed. No reward given; this card will return sooner.");
  }

  function nextReviewCard() {
    setReviewIndex((value) => value + 1);
    setReviewInput("");
    setReviewRevealed(false);
    setReviewResolved(false);
    setReviewFeedback("Ready for a quick memory check.");
  }

  function recoverRun() {
    setSaveState((current) => ({
      ...current,
      health: Math.max(current.health, 64),
      lives: Math.max(current.lives, 2),
      streak: 0
    }));
    setQuestionFeedback({
      tone: "idle",
      message: "Recovery applied. Read one worked example, then continue."
    });
  }

  function updateWritingAnswer(fieldId: string, value: string) {
    setWritingAnswers((current) => ({
      ...current,
      [fieldId]: value
    }));
  }

  function submitWritingQuest() {
    const missingFields = WRITING_FIELDS.filter((field) => !writingAnswers[field.id].trim());

    if (missingFields.length > 0) {
      setWritingFeedback({
        tone: "wrong",
        message: `Still incomplete. Finish all ${WRITING_FIELDS.length} exam prompts before claiming the writing reward.`
      });
      return;
    }

    if (writingWordCount < 35) {
      setWritingFeedback({
        tone: "wrong",
        message:
          "This is too thin to be useful revision. Expand the answer so it becomes a real exam-style paragraph."
      });
      return;
    }

    setSaveState((current) => {
      if (current.completedWriting) {
        return current;
      }

      return {
        ...current,
        completedWriting: true,
        health: Math.min(100, current.health + 8),
        lives: Math.min(5, current.lives + 1),
        xp: current.xp + 25
      };
    });

    setWritingFeedback({
      tone: "correct",
      message:
        "Writing quest accepted. Mihika earned the reward by completing the full scaffolded response."
    });
  }

  if (!mounted) {
    return <main className="shell loading">Loading Mihika&apos;s quest...</main>;
  }

  return (
    <main className="shell">
      <section className="quest-bar">
        <div className="quest-bar-main">
          <div className="quest-title">
            <p className="eyebrow">Quest Status</p>
            <strong>Mihika&apos;s French Run</strong>
          </div>
          <div className="quest-meters">
            <article>
              <span>Health</span>
              <strong>{saveState.health}</strong>
            </article>
            <article>
              <span>Lives</span>
              <strong>{saveState.lives}</strong>
            </article>
            <article>
              <span>Streak</span>
              <strong>{saveState.streak}</strong>
            </article>
            <article>
              <span>XP</span>
              <strong>{saveState.xp}</strong>
            </article>
            <article>
              <span>Mastery</span>
              <strong>{masteryPercent}%</strong>
            </article>
          </div>
        </div>
        <div className="route-track" aria-label="Learning path progress">
          {routeProgress.map((stage, index) => (
            <a
              key={stage.id}
              href={
                index < 5
                  ? index < 2
                    ? "#arena"
                    : index < 4
                      ? "#memory"
                      : "#writing"
                  : "#writing"
              }
              className={`route-node ${stage.complete ? "complete" : ""}`}
            >
              <span>{index + 1}</span>
              <strong>{stage.title}</strong>
            </a>
          ))}
        </div>
      </section>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Mihika&apos;s French Quest</p>
          <h1>Learn the rule. Remember the rule. Use the rule under exam pressure.</h1>
          <p className="lede">
            This site turns Mihika&apos;s uploaded French worksheets and practice paper into a
            calm game loop: teach, model, retrieve, review, and write. Points exist, but memory
            is the real boss battle.
          </p>
          <div className="hero-actions">
            <a href="#arena" className="button primary">
              Start Today&apos;s Mission
            </a>
            <a href="#memory" className="button secondary">
              Review Memory Cards
            </a>
          </div>
        </div>
        <div className="mission-card">
          <p className="mission-label">Today&apos;s balance</p>
          <div className="meter-grid">
            <article>
              <span>Health</span>
              <strong>{saveState.health}</strong>
            </article>
            <article>
              <span>Lives</span>
              <strong>{saveState.lives}</strong>
            </article>
            <article>
              <span>Streak</span>
              <strong>{saveState.streak}</strong>
            </article>
            <article>
              <span>XP</span>
              <strong>{saveState.xp}</strong>
            </article>
          </div>
          <p className="mission-note">
            Wrong answers cost energy, but every miss also triggers support. The goal is durable
            learning, not endless gaming.
          </p>
        </div>
      </section>

      <section className="stats-strip">
        <article>
          <span>Mastery</span>
          <strong>{masteryPercent}%</strong>
        </article>
        <article>
          <span>Questions solved</span>
          <strong>{totalCorrect}</strong>
        </article>
        <article>
          <span>Corrections needed</span>
          <strong>{totalWrong}</strong>
        </article>
        <article>
          <span>Memory reviews due</span>
          <strong>{reviewDueCount}</strong>
        </article>
      </section>

      <section className="panel">
        <div className="section-head">
          <p className="eyebrow">Route Map</p>
          <h2>Six stages built from the uploaded material</h2>
        </div>
        <div className="stage-grid">
          {stageCompletion.map((stage) => (
            <article className="stage-card" key={stage.id}>
              <p className="stage-level">{stage.level}</p>
              <h3>{stage.title}</h3>
              <p className="stage-skill">{stage.skill}</p>
              <p>{stage.whyItMatters}</p>
              <div className="memory-box">
                <span>Mnemonic</span>
                <strong>{stage.mnemonic}</strong>
              </div>
              <div className="demo-box">
                <span>Worked example</span>
                <p>{stage.demo.prompt}</p>
                <strong>{stage.demo.answer}</strong>
                <p>{stage.demo.explanation}</p>
              </div>
              <footer>
                <span>{stage.source}</span>
                <strong>
                  {stage.mastered}/{stage.total} mastered
                </strong>
              </footer>
            </article>
          ))}
        </div>
      </section>

      <section className="panel memory-panel" id="memory">
        <div className="section-head">
          <p className="eyebrow">Spaced Repetition</p>
          <h2>Memory Garden</h2>
        </div>
        <div className="memory-layout">
          <article className="review-card">
            <span className="review-count">{reviewDueCount} due now</span>
            <h3>{currentReviewCard.front}</h3>
            <label className="text-answer">
              <span>Type the rule from memory</span>
              <input
                value={reviewInput}
                onChange={(event) => setReviewInput(event.target.value)}
                placeholder="Write the key idea before revealing the answer"
              />
            </label>
            {reviewRevealed && <p className="review-answer">{currentReviewCard.back}</p>}
            <p className="review-anchor">{currentReviewCard.anchor}</p>
            <div className="review-actions">
              {reviewResolved ? (
                <button className="button primary" onClick={nextReviewCard}>
                  Next Review Card
                </button>
              ) : (
                <>
                  <button className="button secondary" onClick={revealReviewAnswer}>
                    Reveal And Relearn
                  </button>
                  <button className="button primary" onClick={submitReviewRecall}>
                    Check Recall
                  </button>
                </>
              )}
            </div>
            <p className="feedback neutral">{reviewFeedback}</p>
          </article>
          <article className="memory-rules">
            <h3>How the memory loop works</h3>
            <ul>
              <li>New rules return immediately, then after 1, 3, 7, and 14 days.</li>
              <li>Weak recall lowers health and brings the card back sooner.</li>
              <li>Strong recall raises health and stretches the review gap.</li>
              <li>
                Next scheduled review: {nextReviewDate ? formatDate(nextReviewDate) : "Today"}
              </li>
            </ul>
          </article>
        </div>
      </section>

      <section className="panel" id="arena">
        <div className="section-head">
          <p className="eyebrow">Practice Arena</p>
          <h2>Answer, check, repair, continue</h2>
        </div>
        <article className="arena-card">
          <div className="arena-meta">
            <span>
              Stage: {stages.find((stage) => stage.id === currentQuestion.stageId)?.title}
            </span>
            <strong>
              Question {questionIndex + 1} / {practiceQuestions.length}
            </strong>
          </div>
          <h3>{currentQuestion.prompt}</h3>

          {currentQuestion.type === "mcq" ? (
            <div className="options-grid">
              {currentQuestion.options?.map((option) => (
                <button
                  key={option}
                  className={`option ${selectedOption === option ? "selected" : ""}`}
                  onClick={() => setSelectedOption(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <label className="text-answer">
              <span>Type the answer</span>
              <input
                value={textAnswer}
                onChange={(event) => setTextAnswer(event.target.value)}
                placeholder="Write the corrected French answer here"
              />
            </label>
          )}

          <div className="arena-actions">
            <button className="button primary" onClick={submitQuestion}>
              Check Answer
            </button>
            <button className="button secondary" onClick={nextQuestion}>
              Skip With Penalty
            </button>
          </div>

          <p className={`feedback ${questionFeedback.tone}`}>{questionFeedback.message}</p>
        </article>

        {(saveState.health === 0 || saveState.lives === 0) && (
          <article className="recovery-box">
            <h3>Recovery Camp</h3>
            <p>
              Mihika has pushed hard enough for now. Restore the run, then return through one
              worked example and one memory card.
            </p>
            <button className="button primary" onClick={recoverRun}>
              Recover Health And Lives
            </button>
          </article>
        )}
      </section>

      <section className="panel writing-panel" id="writing">
        <div className="section-head">
          <p className="eyebrow">Writing Quest</p>
          <h2>Ma sortie récente</h2>
        </div>
        <div className="writing-layout">
          <article className="writing-card">
            <h3>Use this exam-ready frame</h3>
            <div className="writing-fields">
              {WRITING_FIELDS.map((field, index) => (
                <label className="writing-input" key={field.id}>
                  <span>
                    {index + 1}. {field.question}
                  </span>
                  <textarea
                    value={writingAnswers[field.id]}
                    onChange={(event) => updateWritingAnswer(field.id, event.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                  />
                </label>
              ))}
            </div>
            <p>
              The reward now depends on actual output: all five prompts answered, then a full
              response of at least 35 words.
            </p>
            <div className="writing-meta">
              <span>Word count</span>
              <strong>{writingWordCount}</strong>
            </div>
            <button className="button primary" onClick={submitWritingQuest}>
              Check Writing Quest
            </button>
            <p className={`feedback ${writingFeedback.tone}`}>{writingFeedback.message}</p>
          </article>
          <article className="writing-card">
            <h3>Starter model</h3>
            <p>
              Samedi dernier, je suis allée au musée avec ma famille. Là-bas, nous avons regardé
              des peintures et j&apos;ai pris beaucoup de photos. J&apos;ai porté une robe bleue et
              des baskets blanches. Après la visite, j&apos;ai mangé un sandwich au fromage et une
              glace au chocolat. J&apos;ai beaucoup aimé la nourriture parce qu&apos;elle était
              délicieuse.
            </p>
            <p className="starter-note">
              Notice the mix: one être verb for movement, then several avoir verbs for completed
              actions.
            </p>
            <div className="memory-box">
              <span>Build your final paragraph from your answers</span>
              <strong>{combinedWriting || "Your completed paragraph preview will appear here."}</strong>
            </div>
          </article>
        </div>
      </section>

      <section className="panel listening-panel">
        <div className="section-head">
          <p className="eyebrow">Listening Prep</p>
          <h2>Train the ear honestly</h2>
        </div>
        <div className="listening-layout">
          <article className="listening-card listening-note">
            <h3>What we do know</h3>
            <p>
              The uploaded `.docx` gives the structure of the listening paper, but not the audio
              script or sound files. So this section teaches strategy for picture-based listening
              without pretending we know the missing answers.
            </p>
            <p className="starter-note">
              Mihika should learn to preview, predict, eliminate, and confirm on the second
              hearing.
            </p>
          </article>
          {listeningStrategies.map((strategy) => (
            <article className="listening-card" key={strategy.title}>
              <h3>{strategy.title}</h3>
              <p>{strategy.description}</p>
              <div className="memory-box">
                <span>Mini mission</span>
                <strong>{strategy.action}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel parent-panel">
        <div className="section-head">
          <p className="eyebrow">Parent View</p>
          <h2>Why this design should help Mihika learn rather than just chase points</h2>
        </div>
        <div className="notes-grid">
          {pedagogyNotes.map((note) => (
            <article className="note-card" key={note.title}>
              <h3>{note.title}</h3>
              <p>{note.body}</p>
            </article>
          ))}
        </div>
        <article className="source-card">
          <h3>Material used</h3>
          <ul>
            {sourceFiles.map((file) => (
              <li key={file}>{file}</li>
            ))}
          </ul>
          <p>
            Internet-informed learning design was guided by research on spacing, retrieval
            practice, and measured gamification rather than point-heavy distraction loops.
          </p>
          <p>
            The listening paper shell was reviewed, but no audio track was included in this
            folder, so the implemented lesson flow focuses on the text-rich grammar, correction,
            reading, and writing material that could be verified directly.
          </p>
        </article>
      </section>
    </main>
  );
}
