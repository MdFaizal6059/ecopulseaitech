import { useEffect, useState } from "react";

export function Confetti({ trigger }: { trigger: number }) {
  const [pieces, setPieces] = useState<{ id: number; left: number; delay: number; color: string; rot: number }[]>([]);
  useEffect(() => {
    if (!trigger) return;
    const colors = ["#10B981", "#34D399", "#FBBF24", "#F472B6", "#60A5FA", "#A78BFA"];
    const next = Array.from({ length: 60 }, (_, i) => ({
      id: trigger * 100 + i,
      left: Math.random() * 100,
      delay: Math.random() * 200,
      color: colors[i % colors.length],
      rot: Math.random() * 360,
    }));
    setPieces(next);
    const t = setTimeout(() => setPieces([]), 2500);
    return () => clearTimeout(t);
  }, [trigger]);

  if (!pieces.length) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 block h-3 w-2 rounded-sm"
          style={{
            left: `${p.left}%`,
            background: p.color,
            transform: `rotate(${p.rot}deg)`,
            animation: `confetti-fall 2.2s cubic-bezier(.2,.6,.4,1) ${p.delay}ms forwards`,
          }}
        />
      ))}
      <style>{`@keyframes confetti-fall { 0% { transform: translateY(-20px) rotate(0deg); opacity:1 } 100% { transform: translateY(110vh) rotate(720deg); opacity:0 } }`}</style>
    </div>
  );
}
