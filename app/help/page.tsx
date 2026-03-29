import Image from "next/image";
import Link from "next/link";

export default function HelpPage() {
  return (
    <main className="shell help-page">
      <Link href="/french" className="help-back">
        ← Back to French Quest
      </Link>

      {/* Hero */}
      <section className="help-hero">
        <Image
          src="/attie/happy.webp"
          alt="Attie waving hello"
          width={120}
          height={120}
          priority
        />
        <div>
          <h1>Hi, I&apos;m Attie!</h1>
          <p className="help-intro">
            I&apos;m Mihika&apos;s golden retriever, and I&apos;m here to help
            her learn French. Well, I can&apos;t actually speak French (I mostly
            speak in tail wags), but I <em>can</em> cheer her on, keep track of
            her progress, and make sure she doesn&apos;t give up when things get
            tough.
          </p>
        </div>
      </section>

      {/* What is this? */}
      <section className="help-section">
        <div className="help-section-header">
          <Image
            src="/attie/thinking.webp"
            alt="Attie thinking"
            width={64}
            height={64}
          />
          <h2>What is this app?</h2>
        </div>
        <p>
          This is Mihika&apos;s personal learning space. Her dad built it just
          for her, using her actual school worksheets and practice papers. Right
          now it&apos;s all about French — specifically, the Grade 7 Term 2 exam
          material.
        </p>
        <p>
          Everything here comes from four real documents: two worksheets on
          pass&#233; compos&#233;, a practice paper with hotel vocabulary and
          reading comprehension, and a guided writing prompt about &ldquo;Ma
          sortie r&#233;cente.&rdquo;
        </p>
        <p>
          The idea is simple: <strong>learn the rule, remember the rule,
          use the rule under exam pressure.</strong> I help by keeping score
          honestly — no shortcuts, no fake rewards.
        </p>
      </section>

      {/* How stages work */}
      <section className="help-section">
        <div className="help-section-header">
          <Image
            src="/attie/celebrating.webp"
            alt="Attie celebrating"
            width={64}
            height={64}
          />
          <h2>The six stages</h2>
        </div>
        <p>
          The material is organized into six stages, each targeting a different
          skill:
        </p>
        <ol className="help-stages-list">
          <li>
            <strong>Hotel Hopper</strong> — recognizing places and signs
            (reception, garage, restaurant)
          </li>
          <li>
            <strong>Verb Workshop</strong> — present tense verbs (prendre,
            mettre, pouvoir, remplir)
          </li>
          <li>
            <strong>Time Travel Lab</strong> — pass&#233; compos&#233; with
            avoir (the default helper)
          </li>
          <li>
            <strong>Elevator of Movement</strong> — &#234;tre verbs and
            agreement (aller, arriver, partir)
          </li>
          <li>
            <strong>Grammar Repair Station</strong> — correcting wrong
            sentences (the trickiest skill!)
          </li>
          <li>
            <strong>Story Scout</strong> — reading comprehension and guided
            writing
          </li>
        </ol>
        <p>
          You can practice any stage at any time — just click
          &ldquo;Practice&rdquo; on the stage card. No gates, no locks.
          But mastery only counts when you get questions right!
        </p>
      </section>

      {/* Health, lives, and streaks */}
      <section className="help-section">
        <div className="help-section-header">
          <Image
            src="/attie/sympathetic.webp"
            alt="Attie being encouraging"
            width={64}
            height={64}
          />
          <h2>Health, lives, and streaks</h2>
        </div>
        <div className="help-meters-grid">
          <div className="help-meter-card">
            <span className="help-meter-icon">&#10084;&#65039;</span>
            <div>
              <strong>Health (0–100)</strong>
              <p>
                Goes up when you answer correctly (+6 for a first-time win, +2
                for repeat wins). Goes down when you get it wrong (−12) or skip
                (−4). If it hits 0, you need Recovery Camp.
              </p>
            </div>
          </div>
          <div className="help-meter-card">
            <span className="help-meter-icon">&#128737;&#65039;</span>
            <div>
              <strong>Lives (0–5)</strong>
              <p>
                You start with 4. Wrong answers cost 1 life. Every 4-question
                streak earns 1 back (up to 5). Lives hitting 0 also triggers
                Recovery Camp.
              </p>
            </div>
          </div>
          <div className="help-meter-card">
            <span className="help-meter-icon">&#128293;</span>
            <div>
              <strong>Streak</strong>
              <p>
                How many correct answers in a row. Resets to 0 on any wrong
                answer or skip. Streaks of 4+ earn bonus lives. It&apos;s a
                focus tracker, not a score.
              </p>
            </div>
          </div>
          <div className="help-meter-card">
            <span className="help-meter-icon">&#11088;</span>
            <div>
              <strong>XP</strong>
              <p>
                Experience points — goes up no matter what (even wrong answers
                earn 3 XP, because trying matters). First-time wins earn 14 XP.
                Writing quest completion earns 25 XP.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Memory Garden */}
      <section className="help-section">
        <div className="help-section-header">
          <Image
            src="/attie/thinking.webp"
            alt="Attie thinking about memory"
            width={64}
            height={64}
          />
          <h2>The Memory Garden</h2>
        </div>
        <p>
          This is where I really earn my keep. The Memory Garden uses
          <strong> spaced repetition</strong> — a fancy way of saying
          &ldquo;review things just before you forget them.&rdquo;
        </p>
        <p>
          Each card comes back on a schedule: immediately, then after 1 day,
          3 days, 7 days, and 14 days. If you remember well, the gap stretches.
          If you forget, it shrinks back. The goal is to move every card to that
          14-day interval — that means it&apos;s locked in long-term memory.
        </p>
      </section>

      {/* Answer grading */}
      <section className="help-section">
        <div className="help-section-header">
          <Image
            src="/attie/happy.webp"
            alt="Attie checking answers"
            width={64}
            height={64}
          />
          <h2>How I check your answers</h2>
        </div>
        <p>
          For multiple-choice questions, I check instantly — no waiting needed.
        </p>
        <p>
          For typed answers (especially pass&#233; compos&#233; and correction
          exercises), I use a smart grading system powered by Google&apos;s
          Gemini. It understands French grammar, so it knows that &ldquo;est
          all&#233;e&rdquo; is different from &ldquo;est alle&rdquo; — the
          accent actually matters for pass&#233; compos&#233;!
        </p>
        <p>
          If the smart grader is busy, I&apos;ll fall back to simple matching
          and let you know. Nobody&apos;s perfect — not even golden retrievers.
        </p>
      </section>

      {/* Recovery */}
      <section className="help-section">
        <div className="help-section-header">
          <Image
            src="/attie/sympathetic.webp"
            alt="Attie at recovery camp"
            width={64}
            height={64}
          />
          <h2>Recovery Camp</h2>
        </div>
        <p>
          If health or lives hit 0, don&apos;t panic — I&apos;m right there
          with you. Recovery Camp restores health to at least 64 and lives to at
          least 2. Your streak resets, but that&apos;s okay.
        </p>
        <p>
          The point isn&apos;t to never fail. The point is to learn from each
          miss and come back stronger. I believe in you, Mihika!
        </p>
      </section>

      {/* Footer */}
      <section className="help-footer">
        <Image
          src="/attie/celebrating.webp"
          alt="Attie celebrating"
          width={80}
          height={80}
        />
        <p>
          Now go practice some French! I&apos;ll be right here, wagging my tail
          every time you get one right.
        </p>
        <Link href="/french" className="button primary">
          Back to French Quest
        </Link>
      </section>
    </main>
  );
}
