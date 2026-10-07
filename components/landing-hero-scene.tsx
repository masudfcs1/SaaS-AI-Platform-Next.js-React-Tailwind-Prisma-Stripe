"use client";

import Image from "next/image";
import { useId, type CSSProperties, type PointerEvent } from "react";
import { ArrowUpRight, AudioLines, Code2, ImageIcon, Plus, Sparkles } from "lucide-react";

import { DuneMark } from "@/components/dune-mark";

const waveform = [20, 34, 52, 31, 66, 85, 49, 70, 100, 64, 41, 77, 92, 59, 35, 63, 45, 25, 39, 17];

export function LandingHeroScene() {
  const sceneId = useId();

  function tiltScene(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty("--scene-x", `${x * 8}deg`);
    event.currentTarget.style.setProperty("--scene-y", `${y * -6}deg`);
  }

  function resetScene(event: PointerEvent<HTMLElement>) {
    event.currentTarget.style.setProperty("--scene-x", "0deg");
    event.currentTarget.style.setProperty("--scene-y", "0deg");
  }

  return (
    <figure className="hero-figure" onPointerMove={tiltScene} onPointerLeave={resetScene}>
      <div className="hero-scene" role="img" aria-label="A sculptural terracotta ring on a stone pedestal, surrounded by floating image, code, and audio cards.">
        <div className="hero-scene-glow" aria-hidden="true" />
        <div className="hero-scene-grid" aria-hidden="true" />
        <div className="hero-scene-topline" aria-hidden="true"><span><span className="hero-status-dot" /> An idea, taking shape</span><Plus size={14} strokeWidth={1} /></div>

        <div className="hero-scene-depth" aria-hidden="true">
          <div className="hero-orbit hero-orbit-back" />
          <div className="hero-sculpture">
            <Image src="/hero-sculpture.svg" alt="" width={640} height={640} priority draggable={false} />
          </div>
          <span className="hero-small-sphere" />
          <span className="hero-small-sphere hero-small-sphere-pearl" />

          <div className="hero-float-card hero-image-card">
            <div className="hero-card-label"><span><ImageIcon size={12} /> Imagine anything</span><ArrowUpRight size={12} /></div>
            <div className="hero-card-art">
              <svg viewBox="0 0 240 150" fill="none">
                <defs>
                  <linearGradient id={`${sceneId}-sky`} x2="0" y2="150" gradientUnits="userSpaceOnUse"><stop stopColor="#e5b895" /><stop offset="1" stopColor="#f2dbc0" /></linearGradient>
                  <linearGradient id={`${sceneId}-dune`} x1="60" y1="50" x2="190" y2="160" gradientUnits="userSpaceOnUse"><stop stopColor="#e0a575" /><stop offset="1" stopColor="#8e4b32" /></linearGradient>
                </defs>
                <path fill={`url(#${sceneId}-sky)`} d="M0 0h240v150H0z" />
                <circle cx="169" cy="46" r="24" fill="#ffedce" />
                <path d="M0 114c47-16 85-66 124-47 44 23 77 51 116 35v48H0Z" fill="#efd0a4" />
                <path d="M0 105C68 55 122 134 240 87v63H0Z" fill={`url(#${sceneId}-dune)`} />
                <path d="M0 136c86-49 145-16 240 0v14H0Z" fill="#bd7852" />
                <path d="M0 143c80-43 139-17 240 0" stroke="#f5d4a9" strokeOpacity=".45" />
              </svg>
              <span><Sparkles size={10} /> A world of your own</span>
            </div>
            <div className="hero-card-footer"><span>From a spark to a scene.</span><span className="hero-card-dots"><i /><i /><i /></span></div>
          </div>

          <div className="hero-float-card hero-code-card">
            <div className="hero-card-label"><span><Code2 size={13} /> Make it possible</span><span className="hero-code-language">TS</span></div>
            <div className="hero-code-lines"><span><b>const</b> idea = <em>&quot;what if?&quot;</em>;</span><span><b>await</b> create(idea);</span><span className="hero-code-comment">{"// Something good starts here."}</span></div>
            <div className="hero-code-status"><span /> A little closer to real</div>
          </div>

          <div className="hero-float-card hero-audio-card">
            <span className="hero-audio-icon"><AudioLines size={19} strokeWidth={1.5} /></span>
            <div className="hero-audio-content"><p>Find your voice</p><div className="hero-waveform">{waveform.map((height, index) => <i key={index} style={{ "--wave-height": `${height}%` } as CSSProperties} />)}</div></div>
            <span className="hero-audio-duration">0:12</span>
          </div>

          <div className="hero-scene-seal"><DuneMark /><span>Made of<br />possibility.</span></div>
        </div>
      </div>
      <figcaption className="hero-scene-caption"><span><span /> A little perspective changes everything.</span><span>01 — ∞</span></figcaption>
    </figure>
  );
}
