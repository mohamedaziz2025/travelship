'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'

interface Column<T> {
  key: string
  label: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  pagination?: {
    page: number
    total: number
    pages: number
    limit: number
  }
  onPageChange?: (page: number) => void
  onSearch?: (query: string) => void
  searchPlaceholder?: string
  loading?: boolean
}

export default function DataTable<T extends { _id?: string; id?: string }>({
  columns,
  data,
  pagination,
  onPageChange,
  onSearch,
  searchPlaceholder = 'Rechercher...',
  loading = false,
}: DataTableProps<T>) {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {onSearch && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#1e293b] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#1e293b]/50 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 bg-[#0f172a]/50">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-gray-400">Chargement...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400">
                    Aucune donnée disponible
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <motion.tr
                    key={item._id || item.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-[#1e293b] transition-colors"
                  >
                    {columns.map((column) => (
                      <td key={column.key} className="px-6 py-4 text-sm text-gray-300">
                        {column.render
                          ? column.render(item)
                          : String((item as any)[column.key] || '-')}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800">
            <div className="text-sm text-gray-400">
              Page {pagination.page} sur {pagination.pages} ({pagination.total} résultats)
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg bg-[#0f172a] border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {/* Page Numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  let pageNum: number
                  if (pagination.pages <= 5) {
                    pageNum = i + 1
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1
                  } else if (pagination.page >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i
                  } else {
                    pageNum = pagination.page - 2 + i
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange?.(pageNum)}
                      className={`
                        px-3 py-1 rounded-lg text-sm font-medium transition-all
                        ${pageNum === pagination.page
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                          : 'bg-[#0f172a] border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800'
                        }
                      `}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              
              <button
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="p-2 rounded-lg bg-[#0f172a] border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
