import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CAST, Monster } from "./monsters.jsx";
import "./multik.css";

/* Медиа импортируются как URL (в однофайловой сборке — как data:URI),
   поэтому мультик работает и из dev-сервера, и как автономный .html */
const MEDIA = import.meta.glob("./media/**/*.{jpg,mp3}", {
  eager: true,
  query: "?url",
  import: "default",
});

function mediaUrl(p) {
  const norm = p.replace(/^\/?assets\//, "").replace(/^\.\//, "");
  const key = Object.keys(MEDIA).find((k) => k.endsWith(norm));
  return key ? MEDIA[key] : p;
}

/* ============================== СЦЕНАРИЙ ============================== *
 *  Монстик рассказывает от первого лица и немножко картавит (р → л).
 *  Все 17 реплик озвучены (line-01 … line-17, голоса из подбора).
 * ===================================================================== */
const SCENES = [
  {
    key: "hello",
    title: "Знакомство",
    bg: "/assets/bg/home.jpg",
    cast: [{ id: "monstik", x: 50, h: 60, wave: true }],
    lines: [
      { who: "monstik", text: "Пливет! Это я — Монстик!", audio: "line-01.mp3" },
    ],
  },
  {
    key: "home",
    title: "Утро дома",
    bg: "/assets/bg/home.jpg",
    cast: [
      { id: "monstik", x: 30, h: 52 },
      { id: "mama", x: 64, h: 68 },
    ],
    lines: [
      {
        who: "monstik",
        text: "Сегодня мой пельвый день! Мы с мамой идём в центл, к логопеду.",
        audio: "line-02.mp3",
      },
      {
        who: "monstik",
        text: "Мне немножко стлашно... Там новые люди и незнакомые места.",
        audio: "line-03.mp3",
      },
      {
        who: "monstik",
        text: "Но я гелой! Гелой немножко боится, но всё равно идёт!",
        audio: "line-04.mp3",
      },
      {
        who: "mama",
        text: "Я рядом, солнышко. Логопед тебе поможет, а я всегда буду с тобой.",
        audio: "line-05.mp3",
      },
    ],
  },
  {
    key: "road",
    title: "По дороге",
    bg: "/assets/bg/street.jpg",
    walk: true,
    cast: [
      { id: "monstik", x: 32, h: 50 },
      { id: "mama", x: 60, h: 64 },
    ],
    lines: [
      {
        who: "monstik",
        text: "Мы будем учить букву... эту... Л!",
        audio: "line-06.mp3",
      },
      {
        who: "mama",
        text: "Букву Р, Монстик. Которая рычит: р-р-р!",
        audio: "line-07.mp3",
      },
      {
        who: "monstik",
        text: "Да! Вот эту, котлая лычит! Ха-ха!",
        audio: "line-08.mp3",
      },
    ],
  },
  {
    key: "center",
    title: "Реабилитационный центр",
    bg: "/assets/bg/center.jpg",
    cast: [
      { id: "monstik", x: 22, h: 48 },
      { id: "mama", x: 46, h: 62 },
      { id: "teacher", x: 74, h: 60, wave: true },
    ],
    lines: [
      {
        who: "monstik",
        text: "Ой... вот и центл. Немножко волнуюсь... Но я гелой!",
        audio: "line-09.mp3",
      },
      {
        who: "teacher",
        text: "Привет, Монстик! Я тётя Аня, твой логопед. Не переживай, у нас всё будет как игра.",
        audio: "line-10.mp3",
      },
      {
        who: "monstik",
        text: "Пливет... Я немножко стесняюсь...",
        audio: "line-11.mp3",
        shy: true,
      },
    ],
  },
  {
    key: "room",
    title: "Кабинет логопеда",
    bg: "/assets/bg/room.jpg",
    fx: [{ text: "ЦОК-ЦОК-ЦОК!", x: 74, y: 16, size: 54, delay: 0 }],
    cast: [
      { id: "monstik", x: 32, h: 50 },
      { id: "teacher", x: 66, h: 62 },
    ],
    lines: [
      {
        who: "monstik",
        text: "Ого! Тут мячик, каландаши и весёлые калтинки!",
        audio: "line-12.mp3",
      },
      {
        who: "teacher",
        text: "Поиграем с язычком: цок-цок-цок, как лошадка!",
        audio: "line-13.mp3",
      },
      {
        who: "monstik",
        text: "Цок-цок-цок! Ха-ха-ха! Это как настоящая игла!",
        audio: "line-14.mp3",
      },
    ],
  },
  {
    key: "win",
    title: "Монстик — герой!",
    bg: "/assets/bg/center.jpg",
    finale: true,
    cast: [
      { id: "monstik", x: 38, h: 56, wave: true },
      { id: "mama", x: 68, h: 66 },
    ],
    lines: [
      {
        who: "monstik",
        text: "У меня получилось! Я был гелоем, даже когда было стлашно!",
        audio: "line-15.mp3",
      },
      {
        who: "mama",
        text: "Я тобой горжусь, Монстик. Ты настоящий герой.",
        audio: "line-16.mp3",
      },
      {
        who: "monstik",
        text: "Завтла плиду снова! Пока-пока!",
        audio: "line-17.mp3",
      },
    ],
  },
];

/* время реплики, если аудио ещё нет — по длине текста */
function estimateMs(text) {
  return Math.min(9000, Math.max(2600, text.length * 72)) + 900;
}

function Hearts() {
  const items = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        left: 4 + ((i * 37) % 92),
        delay: (i % 6) * 0.9,
        dur: 5.2 + (i % 5) * 0.8,
        size: 22 + (i % 4) * 10,
      })),
    []
  );
  return (
    <div className="mk-hearts" aria-hidden="true">
      {items.map((h, i) => (
        <span
          key={i}
          style={{
            left: `${h.left}%`,
            fontSize: h.size,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.dur}s`,
          }}
        >
          {i % 3 === 0 ? "⭐" : "❤️"}
        </span>
      ))}
    </div>
  );
}

export default function Cartoon() {
  const [phase, setPhase] = useState("cover"); // cover | play | pause | end
  const [pos, setPos] = useState({ scene: 0, line: 0 });
  const [muted, setMuted] = useState(false);
  const audioRef = useRef(null);

  const scene = SCENES[pos.scene];
  const line = scene.lines[pos.line];
  const speaker = CAST[line.who];

  /* ---------- воспроизведение реплики ---------- */
  useEffect(() => {
    if (phase !== "play") {
      if (audioRef.current) audioRef.current.pause();
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;

    let advanced = false;
    let settled = false;
    let nextTimer = null;

    const next = () => {
      if (advanced) return;
      advanced = true;
      if (nextTimer) clearTimeout(nextTimer);
      const sc = SCENES[pos.scene];
      if (pos.line + 1 < sc.lines.length) {
        setPos({ scene: pos.scene, line: pos.line + 1 });
      } else if (pos.scene + 1 < SCENES.length) {
        setPos({ scene: pos.scene + 1, line: 0 });
      } else {
        setPhase("end");
      }
    };

    /* одна «труба» на линию: либо аудио сказала «конец», либо файла нет */
    const scheduleAdvance = (delay) => {
      if (settled) return;
      settled = true;
      if (nextTimer) clearTimeout(nextTimer);
      nextTimer = setTimeout(next, delay);
    };

    // аудио есть? играем; нет (404/ошибка) — держим реплику по таймеру
    audio.onended = () => scheduleAdvance(650);
    audio.onerror = () => scheduleAdvance(estimateMs(line.text));
    audio.src = mediaUrl(`audio/${line.audio}`);
    audio.muted = muted;
    audio.currentTime = 0;
    const playing = audio.play();
    if (playing && playing.catch) playing.catch(() => {});

    // мёртвый рубильник, если «ended» не придёт никогда
    const guard = setTimeout(() => scheduleAdvance(0), Math.max(15000, estimateMs(line.text) * 2));

    return () => {
      advanced = true;
      if (nextTimer) clearTimeout(nextTimer);
      clearTimeout(guard);
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, pos.scene, pos.line]);

  /* mute без перезапуска реплики */
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  const start = useCallback(() => {
    setPos({ scene: 0, line: 0 });
    setPhase("play");
  }, []);

  const toggle = useCallback(() => {
    setPhase((p) => (p === "play" ? "pause" : p === "cover" || p === "end" ? "play" : "play"));
    if (phase === "cover" || phase === "end") setPos({ scene: 0, line: 0 });
  }, [phase]);

  const restart = useCallback(() => {
    setPos({ scene: 0, line: 0 });
    setPhase("play");
  }, []);

  const gotoScene = useCallback((i) => {
    setPos({ scene: i, line: 0 });
    setPhase("play");
  }, []);

  /* клавиатура: пробел — пауза, R — сначала */
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        toggle();
      } else if (e.key.toLowerCase() === "r" || e.key.toLowerCase() === "к") {
        restart();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, restart]);

  const speakingId = phase === "play" || phase === "pause" ? line.who : null;
  const bubbleActor = scene.cast.find((c) => c.id === line.who);

  return (
    <div className="mk-page">
      <div className="mk-stage">
        {/* фон сцены */}
        <div
          key={scene.key}
          className={`mk-bg ${scene.walk ? "mk-bg--pan" : ""}`}
          style={{ backgroundImage: `url(${mediaUrl(scene.bg)})` }}
        />
        <div className="mk-vignette" />

        {/* финальные сердечки */}
        {scene.finale && (phase === "play" || phase === "pause") && <Hearts />}

        {/* комикс-слова */}
        {(phase === "play" || phase === "pause") &&
          scene.fx?.map((f, i) => (
            <div
              key={i}
              className="mk-fx"
              style={{
                left: `${f.x}%`,
                top: `${f.y}%`,
                fontSize: f.size,
                animationDelay: `${f.delay}s`,
              }}
            >
              {f.text}
            </div>
          ))}

        {/* персонажи */}
        {(phase === "play" || phase === "pause") &&
          scene.cast.map((c) => {
            const def = CAST[c.id];
            const C = def.Component;
            const speaking = speakingId === c.id;
            return (
              <div
                key={`${scene.key}-${c.id}`}
                className={[
                  "mk-actor",
                  "mk-actor--enter",
                  "mk-bob",
                  speaking ? "mk-actor--speaking" : "",
                ].join(" ")}
                style={{
                  left: `${c.x}%`,
                  bottom: "4%",
                  height: `${c.h}vh`,
                  animationDelay: "0s",
                  zIndex: speaking ? 5 : 4,
                  transform: line.shy && speaking ? "translateX(-50%) translateY(6px)" : undefined,
                }}
              >
                <C
                  talking={speaking && phase === "play"}
                  waving={c.wave && !scene.walk}
                  walking={scene.walk && phase === "play"}
                />
              </div>
            );
          })}

        {/* реплика-пузырь */}
        {(phase === "play" || phase === "pause") && bubbleActor && (
          <div
            key={`bubble-${pos.scene}-${pos.line}`}
            className="mk-bubble"
            style={{
              left: `${Math.min(84, Math.max(16, bubbleActor.x))}%`,
              bottom: `${4 + bubbleActor.h + 3}vh`,
              ["--tail-x"]: "50%",
            }}
          >
            {line.text}
          </div>
        )}

        {/* субтитры */}
        {(phase === "play" || phase === "pause") && (
          <div key={`sub-${pos.scene}-${pos.line}`} className="mk-subtitle">
            <div className="mk-sub-name" style={{ background: speaker.color }}>
              {speaker.name}
            </div>
            <div className="mk-sub-text">
              {line.text.split(" ").map((w, i) => (
                <span key={i} className="w" style={{ animationDelay: `${i * 0.09}s` }}>
                  {w}&nbsp;
                </span>
              ))}
            </div>
          </div>
        )}

        {/* верхняя панель */}
        <div className="mk-top">
          <div className="mk-scene-chip">
            {pos.scene + 1} / {SCENES.length} · {scene.title}
          </div>
          <div className="mk-dots">
            {SCENES.map((s, i) => (
              <button
                key={s.key}
                className={`mk-dot ${i === pos.scene ? "mk-dot--on" : ""}`}
                title={s.title}
                onClick={() => gotoScene(i)}
              />
            ))}
          </div>
        </div>

        {/* управление */}
        <div className="mk-controls">
          <button className="mk-btn mk-btn--icon" onClick={restart} title="Сначала (R)">
            ↺
          </button>
          <button className="mk-btn mk-btn--play" onClick={toggle}>
            {phase === "play" ? "⏸ Пауза" : "▶ Смотреть"}
          </button>
          <button
            className="mk-btn mk-btn--icon"
            onClick={() => setMuted((m) => !m)}
            title={muted ? "Включить звук" : "Выключить звук"}
          >
            {muted ? "🔇" : "🔊"}
          </button>
        </div>

        {/* титульный экран */}
        {phase === "cover" && (
          <div className="mk-cover">
            <div className="mk-cover-hero">
              <Monster waving />
            </div>
            <div className="mk-cover-title">
              Монстик идёт <em>к логопеду</em>
            </div>
            <div className="mk-cover-sub">
              Мультик про первый день в реабилитационном центре. Монстик немножко
              картавит и немножко волнуется — но он настоящий герой!
            </div>
            <div className="mk-cover-badge">
              🦷 Первый день · Мама рядом · Буква «Р» впереди
            </div>
            <div className="mk-cover-actions">
              <button className="mk-btn mk-btn--hero" onClick={start}>
                ▶ Смотреть мультик
              </button>
            </div>
            <div className="mk-note">
              Со звуком! Нажмите «Смотреть мультик» — Монстик расскажет всё сам.
              Клавиша пробела — пауза, R — посмотреть сначала.
            </div>
          </div>
        )}

        {/* финальный экран */}
        {phase === "end" && (
          <div className="mk-cover mk-cover--end">
            <div className="mk-cover-hero">
              <Monster waving />
            </div>
            <div className="mk-cover-title">
              Конец! <em>Монстик — герой!</em>
            </div>
            <div className="mk-cover-sub">
              Ходить к логопеду — не стлашно. Это как игра! Завтла Монстик плидёт
              снова.
            </div>
            <div className="mk-cover-badge">
              ❤️ Мама рядом · ⭐ Монстик старается · 🎯 Буква «Р» обязательно получится
            </div>
            <div className="mk-cover-actions">
              <button className="mk-btn mk-btn--hero" onClick={restart}>
                ↺ Смотреть снова
              </button>
              <button
                className="mk-btn mk-btn--ghost"
                onClick={() => setPhase("cover")}
              >
                К началу
              </button>
            </div>
          </div>
        )}
      </div>

      <audio ref={audioRef} preload="auto" />
    </div>
  );
}
