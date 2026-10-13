'use client'

import { Minus, Plus } from 'lucide-react'
import { useState } from 'react'

/** Întrebările vin de pe server, din dicționarul limbii: în browser ajunge doar limba paginii. */
export default function FaqAccordion({ title, items }) {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl">{title}</h2>

      <ul className="flex flex-col border-t border-line">
        {items.map((item, index) => {
          const isOpen = openIndex === index
          const panelId = `faq-panel-${index}`
          const buttonId = `faq-button-${index}`

          return (
            <li key={item.question} className="border-b border-line">
              <h3>
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-start justify-between gap-6 py-5 text-left font-sans text-base font-medium text-ink transition-colors duration-200 ease-out hover:text-accent-deep"
                >
                  {item.question}
                  {isOpen ? (
                    <Minus size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
                  ) : (
                    <Plus size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-muted" />
                  )}
                </button>
              </h3>

              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                hidden={!isOpen}
                className="pb-5"
              >
                <p className="max-w-[62ch] text-sm leading-[1.75] text-ink-soft">{item.answer}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
