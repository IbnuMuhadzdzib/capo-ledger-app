import { useAppStore } from '../store/useAppStore'
import { useIncomeStore } from '../store/useIncomeStore'
import { useAllocationStore } from '../store/useAllocationStore'
import { useTellerStore } from '../store/useTellerStore'
import IncomeList from './IncomeList'
import AllocationSummaryView from './AllocationSummaryView'
import type { IncomeRecord, AllocationRecord } from '../types/income'

export default function RightModule() {
  const { activeTab, openForm } = useAppStore()
  const { incomes, deleteIncome, totalPeriod } = useIncomeStore()
  const { allocations, deleteAllocation } = useAllocationStore()
  const say = useTellerStore((s) => s.say)
  
  const handleEditIncome = (income: IncomeRecord) => {
    openForm('income', income)
    say('editIncome')
  }

  const handleDeleteIncome = (id: string) => {
    say('deleteIncome')
    deleteIncome(id)
  }

  const handleEditAllocation = (allocation: AllocationRecord) => {
    openForm('allocation', allocation)
    say('editIncome')
  }

  const handleDeleteAllocation = (id: string) => {
    say('deleteIncome')
    deleteAllocation(id)
  }

  return (
    <div className="right-module">
      <div className="right-module-card cursor-no-drag">
        {activeTab === 'daftar' ? (
          <IncomeList incomes={incomes} onEdit={handleEditIncome} onDelete={handleDeleteIncome} />
        ) : (
          <AllocationSummaryView 
            allocations={allocations} 
            totalIncome={totalPeriod} 
            onEdit={handleEditAllocation} 
            onDelete={handleDeleteAllocation} 
          />
        )}
      </div>
    </div>
  )
}
