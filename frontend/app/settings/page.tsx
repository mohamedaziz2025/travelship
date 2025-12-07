'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { Bell, Lock, Globe, Eye, Shield, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    matchNotifications: true,
    messageNotifications: true,
    language: 'fr',
    visibility: 'public',
  })

  const handleLogout = () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout()
      toast.success('Déconnexion réussie')
      router.push('/')
    }
  }

  const handleSave = () => {
    toast.success('Paramètres enregistrés')
  }

  return (
    <div className="min-h-screen bg-light py-24 px-4">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark mb-2">Paramètres</h1>
          <p className="text-dark/60">
            Gérez vos préférences et votre compte
          </p>
        </div>

        <div className="space-y-6">
          {/* Notifications */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Notifications</h2>
                <p className="text-sm text-dark/60">
                  Configurez vos préférences de notifications
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-light-dark rounded-lg cursor-pointer hover:bg-light-darker transition-colors">
                <div>
                  <p className="font-medium">Notifications par email</p>
                  <p className="text-sm text-dark/60">
                    Recevez des emails pour les mises à jour importantes
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) =>
                    setSettings({ ...settings, emailNotifications: e.target.checked })
                  }
                  className="w-5 h-5 text-primary rounded"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-light-dark rounded-lg cursor-pointer hover:bg-light-darker transition-colors">
                <div>
                  <p className="font-medium">Notifications SMS</p>
                  <p className="text-sm text-dark/60">
                    Recevez des SMS pour les événements urgents
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) =>
                    setSettings({ ...settings, smsNotifications: e.target.checked })
                  }
                  className="w-5 h-5 text-primary rounded"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-light-dark rounded-lg cursor-pointer hover:bg-light-darker transition-colors">
                <div>
                  <p className="font-medium">Nouveaux matches</p>
                  <p className="text-sm text-dark/60">
                    Soyez alerté quand quelqu'un correspond à vos critères
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.matchNotifications}
                  onChange={(e) =>
                    setSettings({ ...settings, matchNotifications: e.target.checked })
                  }
                  className="w-5 h-5 text-primary rounded"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-light-dark rounded-lg cursor-pointer hover:bg-light-darker transition-colors">
                <div>
                  <p className="font-medium">Nouveaux messages</p>
                  <p className="text-sm text-dark/60">
                    Recevez une notification pour chaque nouveau message
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.messageNotifications}
                  onChange={(e) =>
                    setSettings({ ...settings, messageNotifications: e.target.checked })
                  }
                  className="w-5 h-5 text-primary rounded"
                />
              </label>
            </div>
          </div>

          {/* Language */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Langue</h2>
                <p className="text-sm text-dark/60">
                  Choisissez votre langue préférée
                </p>
              </div>
            </div>

            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="input"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
            </select>
          </div>

          {/* Privacy */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Confidentialité</h2>
                <p className="text-sm text-dark/60">
                  Contrôlez la visibilité de votre profil
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 bg-light-dark rounded-lg cursor-pointer hover:bg-light-darker transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={settings.visibility === 'public'}
                  onChange={(e) =>
                    setSettings({ ...settings, visibility: e.target.value })
                  }
                  className="w-4 h-4 text-primary"
                />
                <div>
                  <p className="font-medium">Public</p>
                  <p className="text-sm text-dark/60">
                    Tout le monde peut voir votre profil
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 bg-light-dark rounded-lg cursor-pointer hover:bg-light-darker transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="verified"
                  checked={settings.visibility === 'verified'}
                  onChange={(e) =>
                    setSettings({ ...settings, visibility: e.target.value })
                  }
                  className="w-4 h-4 text-primary"
                />
                <div>
                  <p className="font-medium">Utilisateurs vérifiés uniquement</p>
                  <p className="text-sm text-dark/60">
                    Seuls les membres vérifiés peuvent vous contacter
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Security */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Sécurité</h2>
                <p className="text-sm text-dark/60">
                  Protégez votre compte
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full text-left p-4 bg-light-dark rounded-lg hover:bg-light-darker transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-dark/60" />
                  <div>
                    <p className="font-medium">Changer le mot de passe</p>
                    <p className="text-sm text-dark/60">
                      Dernière modification il y a 30 jours
                    </p>
                  </div>
                </div>
                <span className="text-primary text-sm font-medium">Modifier</span>
              </button>

              <button className="w-full text-left p-4 bg-light-dark rounded-lg hover:bg-light-darker transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-dark/60" />
                  <div>
                    <p className="font-medium">Authentification à deux facteurs</p>
                    <p className="text-sm text-dark/60">
                      Ajoutez une couche de sécurité supplémentaire
                    </p>
                  </div>
                </div>
                <span className="text-dark/40 text-sm">Bientôt disponible</span>
              </button>
            </div>
          </div>

          {/* Account Actions */}
          <div className="card">
            <div className="space-y-3">
              <button
                onClick={handleLogout}
                className="w-full p-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <LogOut className="w-5 h-5" />
                Se déconnecter
              </button>

              <button className="w-full p-4 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                Supprimer mon compte
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-4">
            <button
              onClick={() => router.back()}
              className="flex-1 btn-secondary"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="flex-1 btn-primary"
            >
              Enregistrer les modifications
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
