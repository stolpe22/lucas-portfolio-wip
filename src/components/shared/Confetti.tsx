import { useState } from "react";

const COLORS = ["#3e7bfa", "#8b5cf6", "#34d399", "#f3f3f8", "#6d3495"];
const PARTICLE_COUNT = 90;

interface Particle {
  left: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
}

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.4,
    duration: 2.6 + Math.random() * 1.6,
    size: 6 + Math.random() * 7,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));
}

export function Confetti() {
  const [particles] = useState<Particle[]>(generateParticles);

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] overflow-hidden">
      {particles.map((particle, index) => (
        <span
          key={index}
          className="absolute top-0 block rounded-sm [animation-name:confetti-fall] [animation-timing-function:ease-in]"
          style={{
            left: `${particle.left}%`,
            width: particle.size,
            height: particle.size * 0.4,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        ></span>
      ))}
    </div>
  );
}
