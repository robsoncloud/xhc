
import "@xterm/xterm/css/xterm.css"
import XTerminal from "@/components/Terminal";


export default function Home() {


  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex items-center gap-2 px-4 py-2 text-sm border-b border-neutral-600">
        Terminal
      </div>
      <XTerminal />
    </main>
  );
}
