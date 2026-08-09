'use client';

import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

type MemberId = 'luis' | 'machiel' | 'ness';

type PartyMember = {
  id: MemberId;
  name: string;
  hp: number;
  maxHp: number;
  frameClassName: string;
  separatorClassName: string;
  hpClassName: string;
  emblemClassName: string;
};

type CommandId = 'fight' | 'act' | 'item' | 'spare' | 'defend';

type Command = {
  id: CommandId;
  label: string;
  orangeSpriteX: number;
  selectedSpriteX: number;
};

const PARTY: PartyMember[] = [
  {
    id: 'luis',
    name: 'LUIS',
    hp: 90,
    maxHp: 90,
    frameClassName: 'secret-frame-luis',
    separatorClassName: 'secret-flow-luis',
    hpClassName: 'secret-flow-luis',
    emblemClassName: 'border-[#ffe600]',
  },
  {
    id: 'machiel',
    name: 'MACHIEL',
    hp: 110,
    maxHp: 110,
    frameClassName: 'secret-frame-machiel',
    separatorClassName: 'secret-flow-machiel',
    hpClassName: 'secret-flow-machiel',
    emblemClassName: 'border-[#31f7ef]',
  },
  {
    id: 'ness',
    name: 'NESS',
    hp: 80,
    maxHp: 80,
    frameClassName: 'secret-frame-ness',
    separatorClassName: 'secret-flow-ness',
    hpClassName: 'secret-flow-ness',
    emblemClassName: 'border-[#ff3048]',
  },
];

const COMMANDS: Command[] = [
  { id: 'fight', label: 'Lutar', orangeSpriteX: 705, selectedSpriteX: 1182 },
  { id: 'act', label: 'Agir', orangeSpriteX: 740, selectedSpriteX: 1214 },
  { id: 'item', label: 'Item', orangeSpriteX: 775, selectedSpriteX: 1246 },
  { id: 'spare', label: 'Poupar', orangeSpriteX: 810, selectedSpriteX: 1278 },
  { id: 'defend', label: 'Defender', orangeSpriteX: 845, selectedSpriteX: 1310 },
];

function MemberEmblem({ member }: { member: MemberId }) {
  if (member === 'luis') {
    return (
      <svg aria-hidden="true" viewBox="0 0 32 32" className="size-[72%] text-[#ffe600]" shapeRendering="crispEdges">
        <path fill="currentColor" d="M16 1l3.6 10.6L30 16l-10.4 4.4L16 31l-3.6-10.6L2 16l10.4-4.4L16 1Z" />
      </svg>
    );
  }

  if (member === 'machiel') {
    return (
      <svg aria-hidden="true" viewBox="0 0 40 40" className="size-[78%]" shapeRendering="crispEdges">
        <defs>
          <linearGradient id="machiel-secret-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff334d" />
            <stop offset="0.42" stopColor="#ffffff" />
            <stop offset="0.7" stopColor="#31f7ef" />
            <stop offset="1" stopColor="#ef3dff" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="14" fill="#050505" stroke="url(#machiel-secret-ring)" strokeWidth="5" />
        <circle cx="20" cy="20" r="9" fill="#050505" stroke="#ffffff" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className="size-[68%] text-[#ff3048]" shapeRendering="crispEdges">
      <path fill="currentColor" d="m16 3 13 13-13 13L3 16 16 3Z" />
    </svg>
  );
}

function SpriteCommand({ command, selected }: { command: Command; selected: boolean }) {
  const spriteY = selected ? 260 : 357;
  const spriteX = selected ? command.selectedSpriteX : command.orangeSpriteX;
  const style = {
    '--secret-command-x': `${-spriteX * 2}px`,
    '--secret-command-y': `${-spriteY * 2}px`,
    '--secret-command-x-small': `${-spriteX * 1.6}px`,
    '--secret-command-y-small': `${-spriteY * 1.6}px`,
    '--secret-command-x-compact': `${-spriteX * 1.4}px`,
    '--secret-command-y-compact': `${-spriteY * 1.4}px`,
  } as CSSProperties;

  return (
    <span
      aria-hidden="true"
      className="secret-command-sprite block shrink-0"
      data-command={command.id}
      data-selected={selected || undefined}
      style={style}
    />
  );
}

type PartyPanelProps = {
  member: PartyMember;
  active: boolean;
  choice?: CommandId;
  cursorIndex: number;
  onChoose: (command: Command, commandIndex: number) => void;
  onFocusCommand: (commandIndex: number) => void;
  registerButton: (commandIndex: number, button: HTMLButtonElement | null) => void;
};

function PartyPanel({ member, active, choice, cursorIndex, onChoose, onFocusCommand, registerButton }: PartyPanelProps) {
  return (
    <article className={`secret-party-frame p-[3px] ${member.frameClassName}`} data-active={active || undefined} aria-labelledby={`secret-member-${member.id}`}>
      <div className="secret-party-frame__inner bg-black">
        <div className="grid min-h-[6.5rem] grid-cols-[4.1rem_minmax(0,1fr)] items-center gap-x-3 px-4 py-3 sm:min-h-[7.15rem] sm:grid-cols-[4.4rem_minmax(0,1fr)] sm:gap-x-4 sm:px-5">
          <div className={`grid aspect-square w-full place-items-center border-2 bg-black ${member.emblemClassName}`}>
            <MemberEmblem member={member.id} />
          </div>

          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 sm:gap-x-8">
            <h2 id={`secret-member-${member.id}`} className="secret-pixel truncate text-[clamp(1.7rem,5.8vw,2.65rem)] leading-none text-white">
              {member.name}
            </h2>
            <strong aria-label={`HP ${member.hp} de ${member.maxHp}`} className="secret-pixel whitespace-nowrap text-[clamp(1.35rem,4.8vw,2.25rem)] leading-none text-white">
              {member.hp} <span className="text-white">/</span> {member.maxHp}
            </strong>

            <div className="col-span-2 flex items-center justify-end gap-2 pr-1">
              <span className="secret-pixel text-[clamp(0.86rem,2.8vw,1.25rem)] leading-none text-white">HP</span>
              <span className="h-4 w-9 border-[3px] border-white bg-black p-[2px] sm:h-[1.15rem] sm:w-11">
                <span className={`block h-full w-full ${member.hpClassName}`} />
              </span>
            </div>
          </div>
        </div>

        <div className={`h-[3px] ${member.separatorClassName}`} />

        <ul className="secret-command-row flex min-h-[4.55rem] items-center gap-2 overflow-hidden px-4 py-2 sm:min-h-[4.9rem] sm:gap-3 sm:px-12" aria-label={`Comandos de ${member.name}`}>
          {COMMANDS.map((command, commandIndex) => (
            <li key={command.id} className="grid shrink-0 place-items-center">
              <button
                ref={(button) => registerButton(commandIndex, button)}
                type="button"
                disabled={!active}
                aria-label={command.label}
                aria-pressed={choice === command.id}
                className="secret-command-button cursor-pointer border-0 bg-transparent p-0 disabled:cursor-default"
                data-command={command.id}
                onClick={() => onChoose(command, commandIndex)}
                onFocus={() => onFocusCommand(commandIndex)}
                onMouseEnter={() => {
                  if (active) onFocusCommand(commandIndex);
                }}
              >
                <SpriteCommand command={command} selected={choice === command.id || (active && cursorIndex === commandIndex)} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default function SecretBattlePreview() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [cursorIndex, setCursorIndex] = useState(0);
  const [choices, setChoices] = useState<Partial<Record<MemberId, CommandId>>>({});
  const [announcement, setAnnouncement] = useState('Luis inicia a seleção deste turno.');
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const shouldMoveFocus = useRef(false);
  const activeMember = PARTY[activeIndex];

  useEffect(() => {
    if (!shouldMoveFocus.current) return;
    buttonRefs.current[cursorIndex]?.focus();
    shouldMoveFocus.current = false;
  }, [activeIndex, cursorIndex]);

  function chooseCommand(command: Command) {
    const currentMember = PARTY[activeIndex];
    const nextIndex = (activeIndex + 1) % PARTY.length;
    const nextMember = PARTY[nextIndex];
    const nextChoice = choices[nextMember.id];
    const nextCursor = Math.max(COMMANDS.findIndex((item) => item.id === nextChoice), 0);

    setChoices((current) => ({ ...current, [currentMember.id]: command.id }));
    setAnnouncement(`${currentMember.name} escolheu ${command.label}. Agora é a vez de ${nextMember.name}.`);
    buttonRefs.current = [];
    shouldMoveFocus.current = true;
    setCursorIndex(nextCursor);
    setActiveIndex(nextIndex);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();

    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextCursor = (cursorIndex + direction + COMMANDS.length) % COMMANDS.length;
    setCursorIndex(nextCursor);
    buttonRefs.current[nextCursor]?.focus();
  }

  return (
    <section className="relative z-10 mx-auto w-full max-w-[47rem] bg-black" data-testid="secret-battle-interface" aria-label="Interface da batalha secreta" onKeyDown={handleKeyDown}>
      <div className="space-y-2">
        {PARTY.map((member, index) => (
          <PartyPanel
            key={member.id}
            member={member}
            active={index === activeIndex}
            choice={choices[member.id]}
            cursorIndex={cursorIndex}
            onChoose={chooseCommand}
            onFocusCommand={setCursorIndex}
            registerButton={(commandIndex, button) => {
              if (index === activeIndex) buttonRefs.current[commandIndex] = button;
            }}
          />
        ))}
      </div>

      <p className="sr-only" aria-live="polite">{announcement}</p>
      <p className="sr-only">Use Tab ou as setas horizontais para navegar pelos comandos de {activeMember.name}.</p>
      <Link
        href="/"
        className="secret-pixel absolute -bottom-8 right-0 z-20 text-base text-white/30 no-underline transition hover:text-white focus:text-white sm:-right-14 sm:bottom-1"
        aria-label="Sair da batalha e voltar ao início"
      >
        ESC
      </Link>
    </section>
  );
}
