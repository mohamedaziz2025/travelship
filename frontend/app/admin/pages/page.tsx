'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { motion } from 'framer-motion'
import {
  FileEdit,
  Save,
  Eye,
  EyeOff,
  Edit,
  Plus,
  Check,
  X,
  FileText,
  HelpCircle,
  Shield,
  Calendar,
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { adminApi } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface StaticPage {
  _id: string
  key: string
  title: string
  content: string
  category: 'legal' | 'faq' | 'help'
  published: boolean
  lastEditedBy?: { name: string; email: string }
  updatedAt: string
}

const pageTemplates = [
  { key: 'terms', title: 'Conditions Générales d\'Utilisation', category: 'legal' },
  { key: 'privacy', title: 'Politique de Confidentialité', category: 'legal' },
  { key: 'shipping_terms', title: 'Conditions d\'Expédition', category: 'legal' },
  { key: 'faq', title: 'Questions Fréquentes (FAQ)', category: 'faq' },
  { key: 'about', title: 'À Propos', category: 'help' },
  { key: 'help', title: 'Centre d\'Aide', category: 'help' },
]

export default function StaticPagesManagement() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [pages, setPages] = useState<StaticPage[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPage, setEditingPage] = useState<StaticPage | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [activeCategory, setActiveCategory] = useState<'all' | 'legal' | 'faq' | 'help'>('all')

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login')
      return
    }
    loadPages()
  }, [isAuthenticated, user, router])

  const loadPages = async () => {
    try {
      setLoading(true)
      const { data } = await adminApi.getPages()
      setPages(data.data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (page: StaticPage) => {
    try {
      const { data } = await adminApi.getPage(page.key)
      setEditingPage(data.data)
      setPreviewMode(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur')
    }
  }

  const handleSave = async () => {
    if (!editingPage) return

    try {
      await adminApi.updatePage(editingPage.key, {
        title: editingPage.title,
        content: editingPage.content,
        published: editingPage.published,
      })
      toast.success('Page mise à jour avec succès')
      loadPages()
      setEditingPage(null)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur')
    }
  }

  const handleCreate = async (template: typeof pageTemplates[0]) => {
    try {
      await adminApi.createPage({
        key: template.key,
        title: template.title,
        category: template.category,
        content: `# ${template.title}\n\nContenu à rédiger...`,
        published: false,
      })
      toast.success('Page créée avec succès')
      loadPages()
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error('Cette page existe déjà')
      } else {
        toast.error(error.response?.data?.message || 'Erreur')
      }
    }
  }

  const handleTogglePublish = async (page: StaticPage) => {
    try {
      await adminApi.updatePage(page.key, {
        title: page.title,
        content: page.content,
        published: !page.published,
      })
      toast.success(page.published ? 'Page dépubliée' : 'Page publiée')
      loadPages()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur')
    }
  }

  const filteredPages = activeCategory === 'all' 
    ? pages 
    : pages.filter(p => p.category === activeCategory)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'legal': return Shield
      case 'faq': return HelpCircle
      case 'help': return FileText
      default: return FileText
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'legal': return 'blue'
      case 'faq': return 'purple'
      case 'help': return 'green'
      default: return 'gray'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-white text-lg">Chargement...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <AdminSidebar />

      <main className="flex-1 ml-[280px] p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <FileEdit className="w-8 h-8 text-blue-400" />
                Gestion des Pages Statiques
              </h1>
              <p className="text-gray-400">
                CGU, Politique de confidentialité, FAQ et autres pages
              </p>
            </div>
          </div>
        </motion.div>

        {!editingPage ? (
          <>
            {/* Category Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex gap-2 mb-6 overflow-x-auto"
            >
              {[
                { key: 'all', label: 'Toutes', icon: FileText },
                { key: 'legal', label: 'Légal', icon: Shield },
                { key: 'faq', label: 'FAQ', icon: HelpCircle },
                { key: 'help', label: 'Aide', icon: FileText },
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveCategory(tab.key as any)}
                    className={`
                      flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap
                      ${activeCategory === tab.key
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                        : 'bg-[#1e293b] text-gray-400 hover:text-white hover:bg-[#2d3b4e]'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                )
              })}
            </motion.div>

            {/* Create New Page */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 mb-6"
            >
              <h3 className="text-lg font-bold text-white mb-4">Créer une Nouvelle Page</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {pageTemplates.map((template) => {
                  const exists = pages.some(p => p.key === template.key)
                  const Icon = getCategoryIcon(template.category)
                  
                  return (
                    <button
                      key={template.key}
                      onClick={() => !exists && handleCreate(template)}
                      disabled={exists}
                      className={`
                        flex items-center gap-3 p-4 rounded-xl transition-all text-left
                        ${exists
                          ? 'bg-gray-800/50 cursor-not-allowed opacity-50'
                          : 'bg-[#0f172a] border border-gray-700 hover:border-blue-500 hover:bg-[#1a2332]'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 ${exists ? 'text-gray-500' : 'text-blue-400'}`} />
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{template.title}</p>
                        {exists && (
                          <p className="text-xs text-green-400 mt-1">✓ Déjà créée</p>
                        )}
                      </div>
                      {!exists && <Plus className="w-5 h-5 text-gray-400" />}
                    </button>
                  )
                })}
              </div>
            </motion.div>

            {/* Pages List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              {filteredPages.length === 0 ? (
                <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Aucune page dans cette catégorie</p>
                </div>
              ) : (
                filteredPages.map((page, index) => {
                  const Icon = getCategoryIcon(page.category)
                  const color = getCategoryColor(page.category)
                  
                  return (
                    <motion.div
                      key={page._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 bg-${color}-500/20 rounded-xl`}>
                          <Icon className={`w-6 h-6 text-${color}-400`} />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-white">{page.title}</h3>
                            {page.published ? (
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                Publié
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-medium flex items-center gap-1">
                                <EyeOff className="w-3 h-3" />
                                Brouillon
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Modifié le {new Date(page.updatedAt).toLocaleDateString('fr-FR')}
                            </span>
                            {page.lastEditedBy && (
                              <span>par {page.lastEditedBy.name}</span>
                            )}
                          </div>

                          <p className="text-gray-400 text-sm line-clamp-2">
                            {page.content.substring(0, 150)}...
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(page)}
                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          
                          <button
                            onClick={() => handleTogglePublish(page)}
                            className={`
                              p-2 rounded-lg transition-colors
                              ${page.published
                                ? 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-400'
                                : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                              }
                            `}
                            title={page.published ? 'Dépublier' : 'Publier'}
                          >
                            {page.published ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </motion.div>
          </>
        ) : (
          /* Editor View */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
          >
            {/* Editor Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setEditingPage(null)}
                  className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-white">{editingPage.title}</h2>
                  <p className="text-gray-400 text-sm">Clé: {editingPage.key}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className={`
                    px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2
                    ${previewMode
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'bg-blue-500/20 text-blue-400'
                    }
                  `}
                >
                  {previewMode ? <Edit className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  {previewMode ? 'Éditer' : 'Aperçu'}
                </button>

                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2 font-medium"
                >
                  <Save className="w-5 h-5" />
                  Enregistrer
                </button>
              </div>
            </div>

            {/* Title Input */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm font-medium mb-2">Titre</label>
              <input
                type="text"
                value={editingPage.title}
                onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                className="w-full px-4 py-3 bg-[#0f172a] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Content Editor/Preview */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm font-medium mb-2">
                {previewMode ? 'Aperçu' : 'Contenu (Markdown supporté)'}
              </label>
              {previewMode ? (
                <div className="p-6 bg-[#0f172a] border border-gray-700 rounded-xl text-white prose prose-invert max-w-none min-h-[400px]">
                  <div dangerouslySetInnerHTML={{ __html: editingPage.content.replace(/\n/g, '<br>') }} />
                </div>
              ) : (
                <textarea
                  value={editingPage.content}
                  onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                  rows={20}
                  className="w-full px-4 py-3 bg-[#0f172a] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="Rédigez le contenu de la page..."
                />
              )}
            </div>

            {/* Publish Toggle */}
            <div className="flex items-center justify-between p-4 bg-[#0f172a] border border-gray-700 rounded-xl">
              <div>
                <p className="text-white font-medium">Publier la page</p>
                <p className="text-gray-400 text-sm">La page sera visible par tous les utilisateurs</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingPage.published}
                  onChange={(e) => setEditingPage({ ...editingPage, published: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
