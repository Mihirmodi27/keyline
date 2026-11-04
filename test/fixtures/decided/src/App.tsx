export function App() {
  return (
    <div className="z-10 duration-150 transition-opacity motion-reduce:transition-none">
      <p className="italic">Emphasis</p>
      <h2 className="uppercase">Group</h2>
      <div className="z-30 duration-[250ms]" />
      {/* keyline-ignore motion/duration-ladder */}
      <div className="duration-[400ms]" />
    </div>
  );
}
