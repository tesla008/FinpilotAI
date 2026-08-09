import { budgetingAdvice, savingAdvice, investingAdvice, type AdviceCard } from '../data/mockData'

export function AdvicePage() {
  return (
    <div>
      <div className="mb-9">
        <h1 className="font-heading text-h2 font-bold text-heading">AI Advisor</h1>
        <p className="mt-1.5 text-sm text-muted">Recommendations grounded in your actual numbers</p>
      </div>

      <AdviceSection title="Budgeting" cards={budgetingAdvice} />
      <AdviceSection title="Saving" cards={savingAdvice} />
      <AdviceSection title="Investing" cards={investingAdvice} last />
    </div>
  )
}

function AdviceSection({ title, cards, last }: { title: string; cards: AdviceCard[]; last?: boolean }) {
  return (
    <div className={last ? '' : 'mb-11'}>
      <div className="mb-4 text-caption font-semibold tracking-[0.08em] text-muted uppercase">{title}</div>
      <div className="flex flex-col gap-4">
        {cards.map((card) => (
          <AdviceCardView key={card.id} card={card} />
        ))}
      </div>
    </div>
  )
}

function AdviceCardView({ card }: { card: AdviceCard }) {
  return (
    <div
      className="relative rounded-lg p-px"
      style={{ background: 'linear-gradient(135deg, var(--color-cyan), var(--color-primary))' }}
    >
      <div className="relative overflow-hidden rounded-[19px] bg-card p-7">
        <div
          className="pointer-events-none absolute -top-[70px] -right-[70px] h-[200px] w-[200px] rounded-full"
          style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--color-cyan) 30%, transparent), transparent 70%)' }}
        />
        <div className="relative z-10 mb-3.5 flex items-center gap-2.5">
          <span
            className="inline-block h-5.5 w-5.5 rounded-md"
            style={{ background: 'linear-gradient(135deg, var(--color-cyan), var(--color-primary))' }}
          />
          <span className="text-[12px] font-semibold tracking-[0.05em] text-primary uppercase">FinPilot suggests</span>
        </div>
        <div className="relative z-10 grid grid-cols-1 items-center gap-6 sm:grid-cols-[1fr_auto]">
          <div>
            <div className="font-heading mb-2 text-[18px] font-bold text-heading">{card.headline}</div>
            <div className="text-[14.5px] leading-relaxed text-secondary">{card.body}</div>
          </div>
          <div className="flex-none text-right">
            <div className="font-heading text-h2 font-bold tracking-tight text-heading tabular-nums">{card.figure}</div>
            <div className="mt-0.5 text-xs text-muted">{card.figureLabel}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
