export function App() {
  return (
    <main className="uppercase outline-none transition-all h-screen bg-[#ff0000] z-[999] italic duration-[350ms] font-semibold">
      <button>OK</button>
      <button>Save Changes</button>
      <a href="/docs">Click here</a>
      <p style={{ color: "#123456", zIndex: 5000 }}>Don't worry about this apostrophe</p>
      <button className="size-4" aria-label="Close">×</button>
      <nav aria-label="Main"><a href="/p0">Page 0</a><a href="/p1">Page 1</a><a href="/p2">Page 2</a><a href="/p3">Page 3</a><a href="/p4">Page 4</a><a href="/p5">Page 5</a><a href="/p6">Page 6</a><a href="/p7">Page 7</a><a href="/p8">Page 8</a><a href="/p9">Page 9</a></nav>
    </main>
  );
}
