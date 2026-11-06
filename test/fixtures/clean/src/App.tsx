export function App() {
  return (
    <section className="min-h-dvh transition-opacity duration-150 focus-visible:ring-2">
      <button className="outline-none focus-visible:ring-2">Save changes</button>
      <button>Delete project</button>
      <a href="/docs">Read the docs</a>
      <button className="size-6" aria-label="Close">×</button>
      <button className="relative size-4 before:absolute before:-inset-2" aria-label="Dismiss">×</button>
      <nav aria-label="Footer">
        <h2>Product</h2>
        <a href="/a">Pricing</a><a href="/b">Changelog</a><a href="/c">Docs</a><a href="/d">Status</a><a href="/e">Security</a>
        <h2>Company</h2>
        <a href="/f">About</a><a href="/g">Careers</a><a href="/h">Press</a><a href="/i">Contact</a><a href="/j">Legal</a>
      </nav>
    </section>
  );
}
