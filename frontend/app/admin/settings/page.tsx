'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { motion } from 'framer-motion'
import {
  Settings,
  Shield,
  Users,
  AlertCircle,
  Save,
  Plus,
  Trash2,
  Edit,
  X,
  CheckCircle,
  Crown,
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { adminApi } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface SystemSetting {
  _id: string
  key: string
  value: any
  category: string
  description?: string
}

interface Admin {
  _id: string
  name: string
  email: string
  adminRole: 'superadmin' | 'moderator'
  createdAt: string
}

export default function SystemSettings() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'forbidden' | 'moderation' | 'legal' | 'admins'>('forbidden')
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [forbiddenItems, setForbiddenItems] = useState<string[]>([])
  const [newItem, setNewItem] = useState('')
  const [editingItem, setEditingItem] = useState<{ index: number; value: string } | null>(null)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login')
      return
    }
    loadData()
  }, [isAuthenticated, user, router])

  const loadData = async () => {
    try {
      setLoading(true)
      const [settingsRes, adminsRes] = await Promise.all([
        adminApi.getSettings(),
        adminApi.getAdmins(),
      ])
      
      setSettings(settingsRes.data.data)
      setAdmins(adminsRes.data.data)
      
      // Load forbidden items
      const forbiddenSetting = settingsRes.data.data.find(
        (s: SystemSetting) => s.key === 'forbidden_items'
      )
      if (forbiddenSetting && Array.isArray(forbiddenSetting.value)) {
        setForbiddenItems(forbiddenSetting.value)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleAddForbiddenItem = async () => {
    if (!newItem.trim()) return

    const updatedItems = [...forbiddenItems, newItem.trim()]
    
    try {
      await adminApi.updateSetting({
        key: 'forbidden_items',
        value: updatedItems,
        category: 'forbidden_items',
        description: 'Liste des objets interdits à l\'expédition',
      })
      
      setForbiddenItems(updatedItems)
      setNewItem('')
      toast.success('Objet ajouté à la liste interdite')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur')
    }
  }

  const handleRemoveForbiddenItem = async (index: number) => {
    const updatedItems = forbiddenItems.filter((_, i) => i !== index)
    
    try {
      await adminApi.updateSetting({
        key: 'forbidden_items',
        value: updatedItems,
        category: 'forbidden_items',
        description: 'Liste des objets interdits à l\'expédition',
      })
      
      setForbiddenItems(updatedItems)
      toast.success('Objet retiré de la liste')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur')
    }
  }

  const handleEditForbiddenItem = async (index: number, newValue: string) => {
    if (!newValue.trim()) return

    const updatedItems = [...forbiddenItems]
    updatedItems[index] = newValue.trim()
    
    try {
      await adminApi.updateSetting({
        key: 'forbidden_items',
        value: updatedItems,
        category: 'forbidden_items',
        description: 'Liste des objets interdits à l\'expédition',
      })
      
      setForbiddenItems(updatedItems)
      setEditingItem(null)
      toast.success('Objet modifié')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur')
    }
  }

  const handleUpdateAdminRole = async (adminId: string, newRole: 'superadmin' | 'moderator') => {
    if (user?.adminRole !== 'superadmin') {
      toast.error('Seul un super admin peut modifier les rôles')
      return
    }

    if (!confirm(`Changer le rôle de cet admin en ${newRole} ?`)) return

    try {
      await adminApi.updateAdminRole(adminId, newRole)
      toast.success('Rôle modifié avec succès')
      loadData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur')
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
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-400" />
            Paramètres du Système
          </h1>
          <p className="text-gray-400">
            Configuration et gestion de la plateforme
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6 overflow-x-auto"
        >
          {[
            { key: 'forbidden', label: 'Objets Interdits', icon: AlertCircle },
            { key: 'moderation', label: 'Modération', icon: Shield },
            { key: 'legal', label: 'Textes Légaux', icon: Settings },
            { key: 'admins', label: 'Gestion Admins', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap
                  ${activeTab === tab.key
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

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Forbidden Items Tab */}
          {activeTab === 'forbidden' && (
            <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    Objets Interdits à l'Expédition
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Liste des objets qui ne peuvent pas être transportés
                  </p>
                </div>
                <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
                  {forbiddenItems.length} objets
                </span>
              </div>

              {/* Add New Item */}
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddForbiddenItem()}
                  placeholder="Ajouter un objet interdit..."
                  className="flex-1 px-4 py-3 bg-[#0f172a] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddForbiddenItem}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {forbiddenItems.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun objet interdit configuré</p>
                  </div>
                ) : (
                  forbiddenItems.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-4 bg-[#0f172a] border border-gray-800 rounded-xl hover:border-gray-700 transition-colors group"
                    >
                      {editingItem?.index === index ? (
                        <>
                          <input
                            type="text"
                            value={editingItem.value}
                            onChange={(e) => setEditingItem({ index, value: e.target.value })}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') handleEditForbiddenItem(index, editingItem.value)
                              if (e.key === 'Escape') setEditingItem(null)
                            }}
                            className="flex-1 px-3 py-2 bg-[#1e293b] border border-blue-500 rounded-lg text-white focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleEditForbiddenItem(index, editingItem.value)}
                            className="p-2 hover:bg-green-500/20 rounded-lg text-green-400 transition-colors"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                          <span className="flex-1 text-white">{item}</span>
                          <button
                            onClick={() => setEditingItem({ index, value: item })}
                            className="p-2 opacity-0 group-hover:opacity-100 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveForbiddenItem(index)}
                            className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded-lg text-red-400 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Moderation Tab */}
          {activeTab === 'moderation' && (
            <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">
                Paramètres de Modération Automatique
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 bg-[#0f172a] border border-gray-800 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-white font-medium">Auto-modération des annonces</label>
                    <input type="checkbox" className="toggle" />
                  </div>
                  <p className="text-sm text-gray-400">
                    Valider automatiquement les annonces qui passent les filtres
                  </p>
                </div>

                <div className="p-4 bg-[#0f172a] border border-gray-800 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-white font-medium">Détection de spam</label>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                  <p className="text-sm text-gray-400">
                    Bloquer automatiquement les annonces suspectes
                  </p>
                </div>

                <div className="p-4 bg-[#0f172a] border border-gray-800 rounded-xl">
                  <label className="text-white font-medium mb-3 block">
                    Seuil de signalements
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    defaultValue="3"
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-2">
                    <span>1</span>
                    <span>5</span>
                    <span>10</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Nombre de signalements avant action automatique
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Legal Tab */}
          {activeTab === 'legal' && (
            <div className="space-y-6">
              {[
                { key: 'terms', title: 'Conditions Générales d\'Utilisation (CGU)' },
                { key: 'privacy', title: 'Politique de Confidentialité' },
                { key: 'shipping', title: 'Conditions d\'Expédition' },
              ].map((item) => (
                <div
                  key={item.key}
                  className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
                >
                  <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                  <button
                    onClick={() => router.push(`/admin/pages?key=${item.key}`)}
                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl transition-colors font-medium"
                  >
                    Modifier dans Pages Statiques →
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Admins Tab */}
          {activeTab === 'admins' && (
            <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    Gestion des Administrateurs
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Liste des admins et modérateurs de la plateforme
                  </p>
                </div>
                {user?.adminRole === 'superadmin' && (
                  <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2 font-medium">
                    <Plus className="w-5 h-5" />
                    Ajouter Admin
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {admins.map((admin, index) => (
                  <motion.div
                    key={admin._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 bg-[#0f172a] border border-gray-800 rounded-xl hover:border-gray-700 transition-colors"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      {admin.adminRole === 'superadmin' ? (
                        <Crown className="w-6 h-6 text-white" />
                      ) : (
                        <Shield className="w-6 h-6 text-white" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-semibold">{admin.name}</h3>
                        {admin.adminRole === 'superadmin' && (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                            Super Admin
                          </span>
                        )}
                        {admin.adminRole === 'moderator' && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                            Modérateur
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">{admin.email}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        Membre depuis {new Date(admin.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>

                    {user?.adminRole === 'superadmin' && admin._id !== user.id && (
                      <select
                        value={admin.adminRole}
                        onChange={(e) => handleUpdateAdminRole(admin._id, e.target.value as any)}
                        className="px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="superadmin">Super Admin</option>
                        <option value="moderator">Modérateur</option>
                      </select>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
