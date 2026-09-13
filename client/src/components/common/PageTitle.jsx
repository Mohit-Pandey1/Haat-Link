/**
 * PageTitle — section header used at the top of every page.
 *
 * Props:
 *   title  — main h1 heading
 *   action — optional JSX rendered on the right (e.g. a button)
 */
export function PageTitle({ title, action }) {
  return (
    <section className="title">
      <div>
        <h1>{title}</h1>
      </div>
      {action}
    </section>
  );
}
