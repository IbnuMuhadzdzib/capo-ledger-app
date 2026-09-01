import { useState, useEffect } from 'react'
import type { AssociateCategory } from '../types/global'
import { useIncomeStore } from '../store/useIncomeStore'
import { motion } from 'framer-motion'
import { getTopAssociates } from '../lib/chartQueries'

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
    .format(n)
    .replace('Rp', 'IDR')

interface AssociatesProps {
  year: number
}

export default function Associates({ year }: AssociatesProps) {
  const [data, setData] = useState<AssociateCategory[]>([])
  const [loading, setLoading] = useState(true)
  const incomeUpdateTrigger = useIncomeStore((state) => state.updateTrigger)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getTopAssociates(year).then((res) => {
      if (!cancelled) {
        setData(res)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [year, incomeUpdateTrigger])

  const HERO_PHRASES = [
    "A highly valuable earner securing {source} operations.",
    "Loyal associate bringing steady flow from {source}.",
    "Crucial contributor dominating the {source} territory.",
    "Top-tier recruitment yielding heavy bags from {source}.",
    "Trusted Caporegime overseeing all {source} revenues."
  ]

  return (
    <div className="associates-container">
      {loading ? (
        <div className="w-full h-full flex items-center justify-center opacity-50">
          Accessing payroll records...
        </div>
      ) : data.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center opacity-50 font-serif">
          No associates recruited for this year.
        </div>
      ) : (
        <div className="associates-grid">
          {data.map((item, index) => {
            const phrase = HERO_PHRASES[index % HERO_PHRASES.length]
            const heroText = phrase.split('{source}')

            return (
              <motion.div
                key={item.source}
                className="associate-card"
                initial={{ opacity: 0, y: 10, rotate: (Math.random() - 0.5) * 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
              >
                <div className="associate-header">
                  <div className="associate-rank">#{index + 1}</div>
                  <h2>MADE MAN</h2>
                  <div className="associate-stars">★★★</div>
                </div>

                <div className="associate-body">
                  <div className="associate-photo">
                    {/* Suit / Tie icon */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-60">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H5c-1.1 0-2 .9-2 2v2m14-10a4 4 0 100-8 4 4 0 000 8zm-8 4a4 4 0 100-8 4 4 0 000 8z" />
                    </svg>
                  </div>
                  <div className="associate-name" title={item.source}>
                    {item.source}
                  </div>
                </div>

                <div className="associate-footer">
                  <div className="contribution-label">CONTRIBUTION</div>
                  <div className="contribution-amount">{fmt(item.total)}</div>
                </div>

                {/* Hover Overlay */}
                <div className="associate-overlay">
                  <div className="overlay-title-hero">APPRAISAL</div>
                  <div className="overlay-desc-hero">
                    {heroText[0]}<strong>{item.source}</strong>{heroText[1]}
                  </div>
                  <div className="overlay-stamp-hero">TOP EARNER</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
