'use client'

import { useCallback, useRef, useState } from 'react'
import { authFetch } from '@/lib/api-client'

export interface CalorieTarget {
  id: string
  name: string
  category: string
}

const CONCURRENCY = 3

/** Eksik kaloriler için /api/estimate-calories uç noktasını sırayla/paralel çağırır */
export function useCalorieEstimate() {
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(0)
  const [total, setTotal] = useState(0)
  const [failed, setFailed] = useState(0)
  const cancelRef = useRef(false)

  const run = useCallback(
    async (targets: CalorieTarget[], onResult: (id: string, calories: number) => void) => {
      if (targets.length === 0) return { ok: 0, failed: 0 }
      cancelRef.current = false
      setRunning(true)
      setDone(0)
      setFailed(0)
      setTotal(targets.length)

      let cursor = 0
      let ok = 0
      let bad = 0

      const worker = async () => {
        while (!cancelRef.current) {
          const t = targets[cursor++]
          if (!t) return
          try {
            const res = await authFetch('/api/estimate-calories', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ mode: 'quick', itemName: t.name, categoryHint: t.category }),
            })
            const data = await res.json().catch(() => ({}))
            if (res.ok && data.success && typeof data.calories === 'number') {
              onResult(t.id, data.calories)
              ok++
            } else {
              bad++
              setFailed(bad)
            }
          } catch {
            bad++
            setFailed(bad)
          }
          setDone((d) => d + 1)
        }
      }

      await Promise.all(Array.from({ length: Math.min(CONCURRENCY, targets.length) }, worker))
      setRunning(false)
      return { ok, failed: bad }
    },
    []
  )

  const cancel = useCallback(() => {
    cancelRef.current = true
  }, [])

  return { run, cancel, running, done, total, failed }
}
