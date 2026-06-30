import { create } from 'zustand'
import { pickTellerLine, type TellerContext } from '../teller'

interface TellerStore {
  line: string
  say: (context: TellerContext) => void
}

export const useTellerStore = create<TellerStore>()((set) => ({
  line: pickTellerLine('idle'),
  say: (context) => set({ line: pickTellerLine(context) })
}))
