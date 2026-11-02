import { useEffect, useRef, useState } from "react";
import { CONFIG as C } from "./config.js";

const rand = (a, b) => a + Math.random() * (b - a);
const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fill = (s) => s.replace("{date}", C.meetDateLabel);

function useOnce(threshold, cb) {
    const ref = useRef(null);
    useEffect(() => {
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { cb(); io.disconnect(); }
        }, { threshold });
        io.observe(ref.current);
        return () => io.disconnect();
    }, []);
    return ref;
}

function Reveal({ as: Tag = "div", className = "", children, ...p }) {
    const [on, setOn] = useState(false);
    const ref = useOnce(0.15, () => setOn(true));
    return <Tag ref={ref} className={`reveal ${on ? "in" : ""} ${className}`} {...p}>{children}</Tag>;
}

function Sparkles() {
    const ref = useRef(null);
    useEffect(() => {
        const cv = ref.current, cx = cv.getContext("2d");
        let w, h, raf;
        const size = () => { w = cv.width = innerWidth; h = cv.height = innerHeight; };
        size();
        addEventListener("resize", size);
        const m = { x: -999, y: -999 };
        const move = (e) => { m.x = e.clientX; m.y = e.clientY; };
        addEventListener("pointermove", move);
        const mk = (init) => {
            const ember = Math.random() < 0.4;
            return { ember, x: rand(0, w), y: init ? rand(0, h) : h + 10, r: ember ? rand(1, 2.4) : rand(0.8, 2.2), v: ember ? rand(0.3, 0.7) : rand(0.1, 0.35), p: rand(0, 6.3) };
        };
        const dots = Array.from({ length: 70 }, () => mk(true));
        const draw = (t) => {
            cx.clearRect(0, 0, w, h);
            for (const d of dots) {
                if (!reduce()) { d.y -= d.v; d.x += Math.sin(t / 2000 + d.p) * 0.25; }
                const dx = d.x - m.x, dy = d.y - m.y, dist = Math.hypot(dx, dy);
                if (dist < 140 && dist > 0) { d.x += (dx / dist) * (140 - dist) * 0.04; d.y += (dy / dist) * (140 - dist) * 0.04; }
                if (d.y < -10) Object.assign(d, mk(false));
                const a = 0.25 + 0.55 * Math.abs(Math.sin(t / 1400 + d.p));
                cx.fillStyle = d.ember ? "#ff4d5e" : "#f6e0a0";
                cx.globalAlpha = a * 0.18; cx.beginPath(); cx.arc(d.x, d.y, d.r * 4, 0, 6.283); cx.fill();
                cx.globalAlpha = a; cx.beginPath(); cx.arc(d.x, d.y, d.r, 0, 6.283); cx.fill();
            }
            raf = requestAnimationFrame(draw);
        };
        raf = requestAnimationFrame(draw);
        return () => { cancelAnimationFrame(raf); removeEventListener("resize", size); removeEventListener("pointermove", move); };
    }, []);
    return <canvas ref={ref} className="layer back" aria-hidden="true" />;
}

function Confetti() {
    const ref = useRef(null);
    useEffect(() => {
        if (reduce()) return;
        const cv = ref.current, cx = cv.getContext("2d");
        const w = (cv.width = innerWidth), h = (cv.height = innerHeight);
        const cols = ["#f6e0a0", "#d9b25a", "#b8892b", "#fff1c1", "#9b1230"];
        const mk = (x, y, burst) => ({ x, y, burst, s: rand(6, 12), c: cols[(Math.random() * cols.length) | 0], vx: burst ? rand(-6, 6) : rand(-1, 1), vy: burst ? rand(-9, -2) : rand(1.5, 4), a: rand(0, 6.3), va: rand(-0.2, 0.2) });
        let bits = Array.from({ length: 150 }, () => mk(rand(0, w), rand(-h, 0)));
        const m = { x: -999, y: -999 };
        const move = (e) => { m.x = e.clientX; m.y = e.clientY; };
        const down = (e) => { for (let i = 0; i < 40; i++) bits.push(mk(e.clientX, e.clientY, true)); };
        addEventListener("pointermove", move);
        addEventListener("pointerdown", down);
        let raf;
        const draw = () => {
            cx.clearRect(0, 0, w, h);
            for (const b of bits) {
                if (b.burst) { b.vy += 0.25; b.vx *= 0.98; }
                b.y += b.vy; b.x += b.vx + (b.burst ? 0 : Math.sin(b.a)); b.a += b.va;
                const dx = b.x - m.x, dy = b.y - m.y, d = Math.hypot(dx, dy);
                if (d < 110 && d > 0) { b.x += (dx / d) * (110 - d) * 0.08; b.y += (dy / d) * (110 - d) * 0.08; }
                if (!b.burst && b.y > h + 10) { b.y = -10; b.x = rand(0, w); }
                cx.save(); cx.translate(b.x, b.y); cx.rotate(b.a); cx.fillStyle = b.c;
                cx.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2); cx.restore();
            }
            bits = bits.filter((b) => !b.burst || b.y < h + 20);
            raf = requestAnimationFrame(draw);
        };
        raf = requestAnimationFrame(draw);
        return () => { cancelAnimationFrame(raf); removeEventListener("pointermove", move); removeEventListener("pointerdown", down); };
    }, []);
    return <canvas ref={ref} className="layer top" aria-hidden="true" />;
}

function useCountdown(iso) {
    const target = new Date(iso).getTime();
    const [now, setNow] = useState(Date.now());
    useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
    if (Number.isNaN(target)) return null;
    const s = Math.max(0, Math.floor((target - now) / 1000));
    return { over: s === 0, parts: [[Math.floor(s / 86400), "days"], [Math.floor(s / 3600) % 24, "hours"], [Math.floor(s / 60) % 60, "minutes"], [s % 60, "seconds"]] };
}

function Letter({ text }) {
    const [go, setGo] = useState(false);
    const [n, setN] = useState(0);
    const ref = useOnce(0.3, () => setGo(true));
    useEffect(() => {
        if (!go) return;
        if (reduce()) { setN(text.length); return; }
        const id = setInterval(() => setN((v) => (v >= text.length ? (clearInterval(id), v) : v + 1)), 32);
        return () => clearInterval(id);
    }, [go, text]);
    return (
        <div ref={ref} className="letter">
            <p className="ghost">{text}</p>
            <p className="typed" aria-hidden="true">{text.slice(0, n)}<i className="caret" /></p>
        </div>
    );
}

const rng = (a) => () => ((a = (a * 1664525 + 1013904223) >>> 0) / 4294967296);
const VW = 70, VH = 900;
const PET = "M50 96C14 80 8 36 50 6C92 36 86 80 50 96Z";

function petal(r, ring, a, k) {
    const L = 22 + r() * 16, R = 22 + r() * 16, t = 2 + r() * 9;
    return {
        d: `M50 50C${50 - L} 48 ${50 - L - 6} ${20 + r() * 7} ${50 - L * 0.7} ${t + 8}Q${50 - L * 0.35} ${t - 4 - r() * 5} 50 ${t + r() * 4}Q${50 + R * 0.35} ${t - 4 - r() * 5} ${50 + R * 0.7} ${t + 8}C${50 + R + 6} ${20 + r() * 7} ${50 + R} 48 50 50Z`,
        sh: `M50 50C${50 - L * 0.9} 44 ${50 - L * 0.95} 26 ${50 - L * 0.55} ${t + 13}C42 30 47 40 50 50Z`,
        hi: `M${50 - L * 0.6} ${t + 9}Q50 ${t - 3 - r() * 3} ${50 + R * 0.6} ${t + 9}`,
        tf: `rotate(${a} 50 50) translate(50 50) scale(${k}) translate(-50 -50)`,
        fill: `url(#p${ring})`, op: 0.2 + r() * 0.25,
    };
}

function makeRose(seed, rings) {
    const r = rng(seed * 7919 + 13), ps = [];
    rings.forEach(([n, k], ring) => {
        const off = r() * 360;
        for (let i = 0; i < n; i++) ps.push(petal(r, ring, off + (i * 360) / n + (r() - 0.5) * 30, k * (0.86 + r() * 0.3)));
    });
    return { ps, tf: `rotate(${r() * 360} 50 50) translate(50 50) scale(1 ${0.84 + r() * 0.14}) translate(-50 -50)`, cx: 48 + r() * 4, cy: 48 + r() * 4 };
}

function makeGarland(seed) {
    const r = rng(seed * 31 + 7), ph = r() * 6, vx = (y) => 22 + 8 * Math.sin(y / 75 + ph);
    const vine = Array.from({ length: 46 }, (_, i) => `${i ? "L" : "M"}${vx(i * 20).toFixed(1)} ${i * 20}`).join(" ");
    const ang = [-40, 40, 140, -140], leaves = [];
    for (let y = 30, n = 0; y < VH; y += 38 + r() * 10, n++) leaves.push({ x: vx(y), y, a: ang[n % 4] + (r() - 0.5) * 40, sx: 0.8 + r() * 0.6, sy: 0.8 + r() * 0.5 });
    const blooms = [60, 240, 420, 600, 790].map((y0, i) => {
        const y = y0 + (r() - 0.5) * 50, s = 46 + r() * 26;
        return { x: vx(y) - 2 - r() * 8, y, s, delay: 0.2 + i * 0.35, d: makeRose(seed * 10 + i, i % 2 ? [[5, 1], [4, 0.7]] : [[6, 1], [5, 0.72], [3, 0.5]]) };
    });
    const buds = [150, 330, 510, 690, 860].map((y0) => { const y = y0 + (r() - 0.5) * 40; return { x: vx(y), y, s: 32 + r() * 12, r: (r() < 0.5 ? -1 : 1) * (22 + r() * 25) }; });
    return { vine, leaves, blooms, buds };
}
const GS = { l: makeGarland(11), r: makeGarland(47) };
const HERO = makeRose(5, [[7, 1], [6, 0.74], [4, 0.5]]);

function Rose({ d, x, y, s, delay = 0 }) {
    return (
        <g transform={`translate(${x - s / 2} ${y - s / 2}) scale(${s / 100})`}>
            <g className="rose">
                <g transform={d.tf}>
                    {d.ps.map((p, i) => (
                        <g key={i} transform={p.tf}>
                            <g className="pet" style={{ animationDelay: `${delay + i * 0.09}s` }}>
                                <path d={p.d} fill={p.fill} stroke="#2a030a" strokeOpacity=".55" strokeWidth="1" />
                                <path d={p.sh} fill="#1a0206" fillOpacity={p.op} />
                                <path d={p.hi} fill="none" stroke="#ff8fa5" strokeOpacity=".5" strokeWidth="1.5" strokeLinecap="round" />
                            </g>
                        </g>
                    ))}
                    <ellipse cx={d.cx} cy={d.cy} rx="5" ry="4" fill="#2a030a" />
                    <path d={`M${d.cx} ${d.cy - 5}c5 0 7 4 4 7s-8 2-8-2`} fill="none" stroke="#ff8fa5" strokeOpacity=".45" strokeWidth="1" strokeLinecap="round" />
                </g>
            </g>
        </g>
    );
}

function Defs() {
    const lg = (id, c) => <linearGradient id={id} x1="0" y1="1" x2="0" y2="0">{c.map((v, i) => <stop key={i} offset={i / 2} stopColor={v} />)}</linearGradient>;
    return (
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
            <defs>
                {lg("p0", ["#3d040e", "#8a0b26", "#c8183c"])}
                {lg("p1", ["#520611", "#a50f2e", "#e0264a"])}
                {lg("p2", ["#6b0818", "#c4163a", "#f04468"])}
                {lg("bd", ["#5a0716", "#b5112f", "#e0264a"])}
                <linearGradient id="gg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4aa35a" /><stop offset="1" stopColor="#12461d" /></linearGradient>
                <symbol id="bud" viewBox="0 0 100 100">
                    <path d="M50 88C26 80 22 46 50 10C78 46 74 80 50 88Z" fill="url(#bd)" stroke="#2a030a" strokeOpacity=".5" />
                    <path d="M50 12C40 36 42 62 56 84" fill="none" stroke="#1a0206" strokeOpacity=".35" strokeWidth="1.4" />
                    <path d="M50 12C62 34 62 60 46 84" fill="none" stroke="#ff8fa5" strokeOpacity=".4" strokeWidth="1.4" />
                    <path d="M50 92C34 94 22 86 14 66C30 70 44 76 50 92ZM50 92C66 94 78 86 86 66C70 70 56 76 50 92ZM50 94C45 82 47 72 50 64C53 72 55 82 50 94Z" fill="url(#gg)" stroke="#0b2a12" strokeWidth="1" />
                </symbol>
                <g id="leaf">
                    <path d="M0 0C6-9 20-12 34 0C20 12 6 9 0 0Z" fill="url(#gg)" stroke="#0b2a12" strokeWidth=".6" />
                    <path d="M2 0H30M10 0L18-5M10 0L18 5M18 0L25-4M18 0L25 4" stroke="#a6e3ae" strokeOpacity=".5" strokeWidth=".5" fill="none" />
                </g>
            </defs>
        </svg>
    );
}

function Garland({ side }) {
    const g = GS[side];
    return (
        <svg className={`garland ${side}`} viewBox={`0 0 ${VW} ${VH}`} aria-hidden="true">
            <g className="sw">
                <path d={g.vine} fill="none" stroke="#14451d" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d={g.vine} fill="none" stroke="#d9b25a" strokeOpacity=".55" strokeWidth=".7" strokeLinecap="round" strokeLinejoin="round" />
                {g.leaves.map((l, i) => <use key={i} href="#leaf" transform={`translate(${l.x} ${l.y}) rotate(${l.a}) scale(${l.sx} ${l.sy})`} />)}
                {g.buds.map((b, i) => <g key={i} transform={`translate(${b.x} ${b.y}) rotate(${b.r})`}><use href="#bud" x={-b.s / 2} y={-b.s * 0.92} width={b.s} height={b.s} /></g>)}
                {g.blooms.map((b, i) => <Rose key={i} d={b.d} x={b.x} y={b.y} s={b.s} delay={b.delay} />)}
            </g>
        </svg>
    );
}

function FlyingPetals({ n, seed, drift }) {
    const [list] = useState(() => {
        const r = rng(seed * 13 + 5);
        return Array.from({ length: n }, () => ({
            s: 14 + r() * 16, x: r() * 100, rot: (r() - 0.5) * 720,
            dx: drift ? (r() - 0.5) * 30 : (r() - 0.5) * 90, dy: drift ? 118 : (r() - 0.65) * 80,
            t: drift ? 12 + r() * 10 : 6 + r() * 5, dl: drift ? r() * 12 : 2.4 + r() * 6,
        }));
    });
    return (
        <div className={drift ? "drift" : "fly"} aria-hidden="true">
            {list.map((p, i) => (
                <svg key={i} viewBox="0 0 100 100" className="fp" style={{ width: p.s, height: p.s, "--x": `${p.x}%`, "--dx": `${p.dx}vw`, "--dy": `${p.dy}vh`, "--rot": `${p.rot}deg`, "--t": `${p.t}s`, "--dl": `${p.dl}s` }}>
                    <path d={PET} fill="url(#p1)" stroke="#f6e0a0" strokeOpacity=".4" />
                    <path d="M50 90C46 60 48 36 50 14" stroke="#ff8fa5" strokeOpacity=".45" fill="none" />
                </svg>
            ))}
        </div>
    );
}

const SPARKS = [[8, 12], [88, 18], [98, 60], [72, 94], [6, 82], [46, -6], [-8, 48]];

const ICONS = {
    game: "M7 9h10a4 4 0 0 1 4 4v1a3 3 0 0 1-5.2 2L14 14h-4l-1.8 2A3 3 0 0 1 3 14v-1a4 4 0 0 1 4-4zM8 11v3M6.5 12.5h3M15.5 11.5h.01M17.5 13.5h.01",
    phone: "M8 3h8a1.5 1.5 0 0 1 1.5 1.5v15A1.5 1.5 0 0 1 16 21H8a1.5 1.5 0 0 1-1.5-1.5v-15A1.5 1.5 0 0 1 8 3zM10.5 18h3",
    heart: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z",
    pin: "M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11zM12 10h.01",
};
const Icon = ({ n }) => <svg viewBox="0 0 24 24" aria-hidden="true"><path d={ICONS[n] || ICONS.heart} /></svg>;
const Divider = () => <Reveal className="orn-d" aria-hidden="true"><span /><b>◆</b><span /></Reveal>;

function RouteMap() {
    const P = "M44 34C96 -6 196 116 256 86";
    return (
        <svg className="route" viewBox="0 0 300 120" role="img" aria-label={`${C.placeFrom} to ${C.placeTo}`}>
            <path d={P} className="dots" fill="none" stroke="#d9b25a" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 8" />
            {[[44, 34, C.placeFrom, 0], [256, 86, C.placeTo, 1.2]].map(([x, y, t, d]) => (
                <g key={t} transform={`translate(${x} ${y})`}>
                    <circle r="4" fill="none" stroke="#e0264a" className="pulse" style={{ animationDelay: `${d}s` }} />
                    <path d="M0 0C-9-9-12-14-12-19a12 12 0 0 1 24 0C12-14 9-9 0 0Z" fill="#c4163a" stroke="#f6e0a0" strokeWidth="1" />
                    <circle cy="-19" r="4" fill="#f6e0a0" />
                    <text y="17" textAnchor="middle">{t}</text>
                </g>
            ))}
            {!reduce() && <circle r="3.2" fill="#f6e0a0"><animateMotion dur="6s" repeatCount="indefinite" path={P} /></circle>}
        </svg>
    );
}

const CORNER = (() => {
    const L = [[70, 30, -35], [105, 31, 40], [145, 29, -40], [185, 35, 35]];
    return {
        leaves: [...L.map(([x, y, a]) => ({ x, y, a })), ...L.map(([x, y, a]) => ({ x: y, y: x, a: 90 - a }))],
        blooms: [[34, 34, 92, 21], [128, 38, 50, 22], [38, 128, 50, 23], [200, 52, 38, 24], [52, 200, 38, 25]].map(([x, y, s, seed], i) => ({ x, y, s, delay: 0.3 + i * 0.25, d: makeRose(seed, i ? [[5, 1], [4, 0.7]] : [[7, 1], [6, 0.74], [4, 0.5]]) })),
        buds: [[222, 46, 85], [46, 222, 175]],
    };
})();

function Corner({ pos }) {
    return (
        <svg className={`corner ${pos}`} viewBox="0 0 260 260" aria-hidden="true">
            {["M0 18C70 40 140 14 225 46", "M18 0C40 70 14 140 46 225"].map((d) => (
                <g key={d}><path d={d} fill="none" stroke="#14451d" strokeWidth="4" strokeLinecap="round" /><path d={d} fill="none" stroke="#d9b25a" strokeOpacity=".55" strokeWidth=".8" /></g>
            ))}
            {CORNER.leaves.map((l, i) => <use key={i} href="#leaf" transform={`translate(${l.x} ${l.y}) rotate(${l.a}) scale(1.3)`} />)}
            {CORNER.buds.map(([x, y, r], i) => <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}><use href="#bud" x="-18" y="-33" width="36" height="36" /></g>)}
            {CORNER.blooms.map((b, i) => <Rose key={i} d={b.d} x={b.x} y={b.y} s={b.s} delay={b.delay} />)}
        </svg>
    );
}

const wx = (c) => (c === 0 ? "Clear" : c < 4 ? "Partly cloudy" : c < 50 ? "Foggy" : c < 70 ? "Rain" : c < 85 ? "Showers" : "Thunderstorm");

function Together() {
    const [now, setNow] = useState(Date.now());
    const [info, setInfo] = useState({});
    useEffect(() => { const id = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(id); }, []);
    useEffect(() => {
        C.places.forEach(async (p) => {
            try {
                const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lon}&current=temperature_2m,weather_code`);
                const j = await r.json();
                setInfo((o) => ({ ...o, [p.name]: `${Math.round(j.current.temperature_2m)}°C · ${wx(j.current.weather_code)}` }));
            } catch { /* offline: keep the dash */ }
        });
    }, []);
    return (
        <>
            <div className="tw">
                {C.places.map((p) => (
                    <div key={p.name}>
                        <h4>{p.name}</h4>
                        <b>{new Intl.DateTimeFormat([], { hour: "numeric", minute: "2-digit", timeZone: p.tz }).format(now)}</b>
                        <small>{info[p.name] || "…"}</small>
                    </div>
                ))}
            </div>
            <p className="soft">{C.togetherLine}</p>
        </>
    );
}

function Depth() {
    const els = useRef([]);
    const [items] = useState(() => {
        const r = rng(77), k = innerWidth < 600 ? 0.6 : 1;
        const deep = [[10, 20, 640, 0.06], [80, 70, 560, 0.05], [30, 120, 720, 0.07]].map(([x, y, s, f], i) => ({ deep: true, x, y, s: s * k, f, d: makeRose(61 + i, [[7, 1], [6, 0.74], [4, 0.5]]) }));
        const mid = Array.from({ length: 14 }, () => ({ x: r() * 100, y: r() * 100, s: 22 + r() * 40, f: 0.15 + r() * 0.15, rot: r() * 360 }));
        return [...deep, ...mid];
    });
    useEffect(() => {
        let raf = 0;
        const upd = () => {
            raf = 0;
            const H = innerHeight, W = innerWidth, sy = reduce() ? 0 : scrollY;
            items.forEach((it, i) => {
                const el = els.current[i];
                if (!el) return;
                const span = H + it.s, y = ((((it.y / 100) * H - sy * it.f) % span) + span) % span - it.s;
                el.style.transform = `translate3d(${(it.x / 100) * W - it.s / 2}px,${y}px,0) rotate(${it.rot || 0}deg)`;
            });
        };
        const on = () => { if (!raf) raf = requestAnimationFrame(upd); };
        upd();
        addEventListener("scroll", on, { passive: true });
        addEventListener("resize", on);
        return () => { cancelAnimationFrame(raf); removeEventListener("scroll", on); removeEventListener("resize", on); };
    }, [items]);
    return (
        <div className="dp-wrap" aria-hidden="true">
            {items.map((it, i) => (
                <div key={i} ref={(e) => (els.current[i] = e)} className={`dp ${it.deep ? "deep" : "mid"}`} style={{ width: it.s, height: it.s }}>
                    {it.deep
                        ? <svg viewBox="-8 -8 116 116"><Rose d={it.d} x={50} y={50} s={100} /></svg>
                        : <svg viewBox="0 0 100 100"><path d={PET} fill="url(#p1)" stroke="#f6e0a0" strokeOpacity=".35" /></svg>}
                </div>
            ))}
        </div>
    );
}

export default function App() {
    const [open, setOpen] = useState(false);
    const [yes, setYes] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [flipped, setFlipped] = useState({});
    const [tries, setTries] = useState(0);
    const [pos, setPos] = useState(null);
    const [copied, setCopied] = useState(false);
    const [sent, setSent] = useState(false);
    const [hearts] = useState(() => Array.from({ length: 26 }, () => ({ left: rand(0, 100), size: rand(14, 30), dur: rand(5, 10), delay: rand(0, 5) })));
    const audio = useRef(null);
    const count = useCountdown(C.meetDate);

    useEffect(() => {
        if (audio.current) audio.current.volume = Math.min(1, Math.max(0, C.musicVolume ?? 0.35));
    }, []);

    useEffect(() => { document.body.style.overflow = open ? "" : "hidden"; }, [open]);

    useEffect(() => {
        let raf = 0, x = 0, y = 0;
        const on = (e) => {
            x = e.clientX; y = e.clientY;
            if (!raf) raf = requestAnimationFrame(() => { raf = 0; const s = document.documentElement.style; s.setProperty("--x", x + "px"); s.setProperty("--y", y + "px"); });
        };
        addEventListener("pointermove", on);
        return () => removeEventListener("pointermove", on);
    }, []);
    const [frame, setFrame] = useState("sides");
    const bar = useRef(null);
    useEffect(() => {
        if (!open) return;
        const io = new IntersectionObserver((es) => { const hit = es.find((e) => e.isIntersecting); if (hit) setFrame(hit.target.dataset.frame); }, { rootMargin: "-35% 0px -35% 0px" });
        document.querySelectorAll("[data-frame]").forEach((el) => io.observe(el));
        const on = () => { if (bar.current) bar.current.style.transform = `scaleX(${scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)})`; };
        addEventListener("scroll", on, { passive: true });
        return () => { io.disconnect(); removeEventListener("scroll", on); };
    }, [open]);

    const begin = () => {
        setOpen(true);
        window.scrollTo(0, 0);
        audio.current?.play().then(() => setPlaying(true)).catch(() => {});
    };
    const toggle = () => {
        const a = audio.current;
        if (a.paused) a.play().then(() => setPlaying(true)).catch(() => {});
        else { a.pause(); setPlaying(false); }
    };
    const dodge = (e) => {
        e.preventDefault();
        setTries((t) => t + 1);
        setPos({ x: rand(12, innerWidth - 96), y: rand(72, innerHeight - 64) });
    };
    const share = async () => {
        const text = fill(C.shareText);
        try {
            if (C.answerEndpoint) {
                const r = await fetch(C.answerEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ answer: "YES", from: C.herName, message: text, sentAt: new Date().toISOString() }) });
                if (r.ok) { setSent(true); return; }
            }
            if (C.answerEmail) { location.href = `mailto:${C.answerEmail}?subject=${encodeURIComponent("My answer")}&body=${encodeURIComponent(text)}`; return; }
            if (navigator.share) await navigator.share({ text });
            else { await navigator.clipboard.writeText(text); setCopied(true); }
        } catch { /* share dialog closed or offline */ }
    };

    return (
        <>
            <div className="beat" aria-hidden="true" />
            <div className="glow" aria-hidden="true" />
            <div className="spot" aria-hidden="true" />
            <div className="grain" aria-hidden="true" />
            {open && <div className="bar" ref={bar} />}
            {open && <svg className="mark" viewBox="-8 -8 116 116" aria-hidden="true"><Rose d={HERO} x={50} y={50} s={100} delay={0.2} /></svg>}
            <Depth />
            <Sparkles />
            <Defs />
            <div className="frames" data-mode={frame}>
                <Garland side="l" />
                <Garland side="r" />
                <Corner pos="tl" />
                <Corner pos="br" />
            </div>
            {open && <FlyingPetals n={8} seed={3} drift />}
            {C.music && <audio ref={audio} src={C.music} loop preload="auto" />}
            {open && C.music && (
                <button className="music" onClick={toggle} aria-label={playing ? "Pause music" : "Play music"}>{playing ? "❚❚" : "♪"}</button>
            )}

            <div className={`intro ${open ? "gone" : ""}`}>
                <div className="bloom-wrap">
                    <svg className="hero-rose" viewBox="-8 -8 116 116" aria-hidden="true"><Rose d={HERO} x={50} y={50} s={100} delay={0.3} /></svg>
                    <FlyingPetals n={14} seed={5} />
                    {SPARKS.map(([l, t], i) => <i key={i} className="sp" style={{ left: `${l}%`, top: `${t}%`, animationDelay: `${i * 0.5}s` }}>✦</i>)}
                </div>
                <p className="for">For {C.herName}</p>
                <h1 className="shine">{C.introLine}</h1>
                <svg className="orn" viewBox="0 0 240 20" aria-hidden="true">
                    <path d="M4 10H92C100 10 102 3 109 3 114 3 114 9 109 9M236 10H148C140 10 138 3 131 3 126 3 126 9 131 9" fill="none" stroke="#d9b25a" strokeWidth="1" strokeLinecap="round" />
                    <path d="M120 3 127 10 120 17 113 10Z" fill="#d9b25a" />
                </svg>
                <button className="btn solid" onClick={begin}>Open</button>
            </div>

            {open && (
                <main>
                    <header className="hero" data-frame="sides">
                        <h1 className="gold">{C.herName}</h1>
                        <p className="soft">{C.heroLine}</p>
                    </header>

                    <section data-frame="sides">
                        <Reveal as="h2" className="gold">Our Story</Reveal>
                        <div className="timeline">
                            {C.story.map((m, i) => (
                                <Reveal key={m.title} className="moment" style={{ transitionDelay: `${i * 0.15}s` }}>
                                    <span className="ic"><Icon n={m.icon} /></span>
                                    <span className="when">{m.when}</span>
                                    <h3>{m.title}</h3>
                                    <p>{m.text}</p>
                                </Reveal>
                            ))}
                        </div>
                    </section>
                    <Divider />
                    <section data-frame="corners">
                        <Reveal as="h2" className="gold">Distance Between Us</Reveal>
                        <Reveal><p className="miles gold">{C.miles}</p><RouteMap /><p>{C.distanceText}</p>{C.places?.length > 0 && <Together />}</Reveal>
                        <Reveal className="count">
                            {count && !count.over
                                ? count.parts.map(([n, l]) => <div key={l}><b>{String(n).padStart(2, "0")}</b><span>{l}</span></div>)
                                : count && <p className="gold big">{C.arrivedText}</p>}
                        </Reveal>
                    </section>
                    <Divider />
                    <section data-frame="sides">
                        <Reveal as="h2" className="gold">Reasons I Love You</Reveal>
                        <Reveal className="cards">
                            {C.reasons.map((r, i) => (
                                <button key={i} className="card" aria-pressed={!!flipped[i]} onClick={() => setFlipped((f) => ({ ...f, [i]: !f[i] }))}>
                  <span className="inner">
                    <span className="face front">♥<small>Tap to open</small></span>
                    <span className="face back">{r}</span>
                  </span>
                                </button>
                            ))}
                        </Reveal>
                    </section>
                    <Divider />
                    <section data-frame="corners">
                        <Reveal as="h2" className="gold">A Letter for You</Reveal>
                        <Letter text={C.letter} />
                    </section>
                    <Divider />
                    <section data-frame="sides">
                        <Reveal as="h2" className="gold">What I Promise Until We Meet</Reveal>
                        <Reveal as="ul" className="vows seq">
                            {C.vows.map((v, i) => <li key={v} style={{ transitionDelay: `${i * 0.35}s` }}>{fill(v)}</li>)}
                        </Reveal>
                    </section>
                    <Divider />
                    <section className="question" data-frame="corners">
                        <Reveal><p className="msg">{fill(C.question.message)}</p></Reveal>
                        <Reveal as="h2" className="gold big">{C.question.ask}</Reveal>
                        <Reveal className="choices">
                            <button className="btn solid yes" style={{ transform: `scale(${1 + Math.min(tries, 6) * 0.06})` }} onClick={() => setYes(true)}>{C.question.yes}</button>
                            <span className="slot">
                <button className="btn no" aria-disabled="true" style={pos ? { position: "fixed", left: pos.x, top: pos.y, zIndex: 15 } : undefined}
                        onPointerEnter={dodge} onPointerDown={dodge} onFocus={dodge} onClick={dodge}>{C.question.no}</button>
              </span>
                        </Reveal>
                    </section>
                </main>
            )}

            {yes && (
                <div className="celebrate" role="dialog" aria-modal="true" aria-label={C.celebrationTitle}>
                    <Confetti />
                    <div className="hearts" aria-hidden="true">
                        {hearts.map((h, i) => <span key={i} className="heart" style={{ left: `${h.left}%`, fontSize: h.size, animationDuration: `${h.dur}s`, animationDelay: `${h.delay}s` }}>♥</span>)}
                    </div>
                    <div className="final">
                        <h2 className="gold big">{C.celebrationTitle}</h2>
                        <p>{fill(C.closing)}</p>
                        <button className="btn solid" onClick={share}>{C.shareButton}</button>
                        {(copied || sent) && <p className="soft" role="status">{sent ? C.sentText : C.copiedText}</p>}
                    </div>
                </div>
            )}
        </>
    );
}