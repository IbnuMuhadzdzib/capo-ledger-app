import { useState, useEffect } from 'react'
import type { MostWantedCategory } from '../types/global'
import { useAllocationStore } from '../store/useAllocationStore'
import { motion } from 'framer-motion'
import { getMostWantedAllocations } from '../lib/chartQueries'

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

interface MostWantedProps {
  year: number
}

export default function MostWanted({ year }: MostWantedProps) {
  const [data, setData] = useState<MostWantedCategory[]>([])
  const [loading, setLoading] = useState(true)
  const allocationUpdateTrigger = useAllocationStore((state) => state.updateTrigger)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    getMostWantedAllocations(year).then((res) => {
      if (!cancelled) {
        setData(res)
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [year, allocationUpdateTrigger])

  const CRIME_PHRASES = [
    "Excessive financial bleeding caused by repeated spending on {label}.",
    "Caught red-handed draining the vault for {label}.",
    "Wanted for serial depletion of assets via {label}.",
    "Guilty of reckless squandering on {label}.",
    "Prime suspect in the {label} embezzlement scheme."
  ]

  return (
    <div className="most-wanted-container">
      {loading ? (
        <div className="w-full h-full flex items-center justify-center opacity-50">
          Fetching records...
        </div>
      ) : data.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center opacity-50 font-serif">
          No criminals found for this year.
        </div>
      ) : (
        <div className="wanted-grid">
          {data.map((item, index) => {
            const phrase = CRIME_PHRASES[index % CRIME_PHRASES.length]
            const crimeText = phrase.split('{label}')

            return (
              <motion.div
                key={item.label}
                className="wanted-poster"
                initial={{ opacity: 0, y: 10, rotate: (Math.random() - 0.5) * 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
              >
                <div className="poster-header">
                  <div className="rank-badge">#{index + 1}</div>
                  <h2>WANTED</h2>
                  <div className="poster-stars">★★★</div>
                </div>

                <div className="poster-body">
                  <div className="suspect-photo-placeholder">
                    {/* Silhouette icon */}
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-40">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <div className="suspect-name" title={item.label}>
                    {item.label}
                  </div>
                </div>

                <div className="poster-footer">
                  <div className="bounty-label">BOUNTY</div>
                  <div className="bounty-amount">{fmt(item.total)}</div>
                </div>

                {/* Hover Overlay */}
                <div className="poster-overlay">
                  <div className="overlay-title">CRIME</div>
                  <div className="overlay-desc">
                    {crimeText[0]}<strong>{item.label}</strong>{crimeText[1]}
                  </div>
                  <div className="overlay-stamp">GUILTY</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
