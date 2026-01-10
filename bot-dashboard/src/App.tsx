import Bots from "./pages/Bots";

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
          <span className="text-lg font-semibold tracking-tight">
            Bot Console
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Bots />
      </main>
    </div>
  );
}
