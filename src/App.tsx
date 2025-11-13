import { useEffect, useState } from "react"
import "./App.css"

export default function App() {
  const CHANCE = 73
  const STORAGE_KEY = "matayoshi-state-v1"

  type State = {
    tries: number
    success: number
    fail: number
    last: "hit" | "miss" | null
    firstHitAt: number | null
    ended: boolean
  }

  const [state, setState] = useState<State>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw
        ? { ...JSON.parse(raw) }
        : { tries: 0, success: 0, fail: 0, last: null, firstHitAt: null, ended: false }
    } catch {
      return { tries: 0, success: 0, fail: 0, last: null, firstHitAt: null, ended: false }
    }
  })

  const [poops, setPoops] = useState<{ id: number; left: number; size: number; duration: number }[]>([])
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const draw = () => {
    if (state.ended) return

    const hit = Math.floor(Math.random() * CHANCE) === 0
    const nextTries = state.tries + 1
    const firstTime = hit && state.firstHitAt === null

    setState((s) => ({
      ...s,
      tries: nextTries,
      success: s.success + (hit ? 1 : 0),
      fail: s.fail + (hit ? 0 : 1),
      last: hit ? "hit" : "miss",
      firstHitAt: firstTime ? nextTries : s.firstHitAt,
      ended: firstTime ? true : s.ended,
    }))

    if (hit) {
      triggerPoopRain()
      if (firstTime) {
        // 💩を降らせてから3秒後に結果画面へ
        setTimeout(() => setShowResult(true), 2000)
      }
    }
  }

  const triggerPoopRain = () => {
    const newPoops = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 100,
      size: 24 + Math.random() * 32,
      duration: 3 + Math.random() * 2,
    }))
    setPoops(newPoops)
    setTimeout(() => setPoops([]), 4000)
  }

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY)
    window.location.reload()
  }

  // 🎉 終了画面
  if (showResult && state.firstHitAt) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50 text-center">
        <h1 className="text-5xl font-extrabold mb-6 text-amber-800 drop-shadow">
          💩 終了！
        </h1>
        <p className="text-2xl text-gray-800 mb-8">
          {state.firstHitAt}日目で漏らしました！
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-amber-600 text-white text-lg font-semibold rounded-xl shadow hover:bg-amber-700"
        >
          もう一度挑戦
        </button>
        <footer className="mt-12 text-xs text-gray-500">
          © 2025 Matayoshi Simulation
        </footer>
      </div>
    )
  }

  // 💩 ゲーム画面
  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-center 
      bg-gradient-to-b from-yellow-100 to-orange-100 p-6 relative overflow-hidden`}
    >
      {/* 💩 が降る */}
      {poops.map((p) => (
        <span
          key={p.id}
          className="poop"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animationDuration: `${p.duration}s`,
          }}
        >
          💩
        </span>
      ))}

      <h1 className="text-4xl font-extrabold mb-4 text-amber-800 drop-shadow">
        💩 マタヨシ
      </h1>
      <p className="text-gray-700 mb-8">
        ボタンを押すと 1/73 の確率でうんこを漏らします。
      </p>

      <button
        onClick={draw}
        disabled={state.ended}
        className={`px-8 py-4 rounded-full text-xl font-bold shadow-lg transition-all ${
          state.ended
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-amber-600 text-white hover:bg-amber-700 active:scale-95"
        }`}
      >
        抽選する（1/73）
      </button>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 mb-2">直近の結果：</p>
        <p
          className={`text-3xl font-bold ${
            state.last === "hit"
              ? "text-red-600"
              : state.last === "miss"
              ? "text-gray-700"
              : "text-gray-400"
          }`}
        >
          {state.last === "hit"
            ? "💩 うんこを漏らした！！！"
            : state.last === "miss"
            ? "🚽 間に合った"
            : "未実行"}
        </p>
      </div>

      

      <div className="grid grid-cols-3 gap-3 mt-8 w-72 text-center">
        <Stat label="試行回数" value={state.tries} />
        <Stat label="漏らした回数" value={state.success} />
        <Stat label="セーフ回数" value={state.fail} />
      </div>

      <footer className="mt-8 text-xs text-gray-500">
        © 2025 Matayoshi Simulation.
      </footer>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/70 p-4 shadow-sm">
      <p className="text-xs text-gray-600">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  )
}
