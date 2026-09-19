import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <section className="state-page">
      <span className="eyebrow">404</span>
      <h1>That page is not on the menu.</h1>
      <p>The address may be outdated or the pizza may have been removed.</p>
      <Link className="button button--primary" to="/">Back to menu</Link>
    </section>
  );
}
