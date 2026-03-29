import Link from "next/link";

export default function Home() {
  return (
    <main className="shell home-shell">
      <div className="home-content">
        <p className="eyebrow">Mihu Learning</p>
        <h1 className="home-title">Mihika&apos;s Learning Hub</h1>
        <p className="home-subtitle">
          Your personal exam prep — built just for you.
        </p>
        <Link href="/french" className="button primary">
          Start French Quest
        </Link>
      </div>
    </main>
  );
}
