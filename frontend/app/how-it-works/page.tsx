'use client'

import { NavBar } from '@/components/navbar'
import { ArrowRight, Package, Plane, Shield, Search, MessageCircle, DollarSign, CheckCircle, Users, Star, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-light">
      <NavBar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent">
        <div className="container max-w-4xl mx-auto text-center">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            Comment fonctionne{' '}
            <span className="text-gradient">ShipperTrip</span> ?
          </h1>
          <p className="text-xl text-dark/70 mb-8">
            Découvrez comment nous connectons voyageurs et expéditeurs en toute simplicité
          </p>
        </div>
      </section>

      {/* Pour les Senders */}
      <section className="py-20 bg-white">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge-info mb-4 inline-block">📦 Pour les Senders</span>
            <h2 className="text-4xl font-bold mb-4">Envoyez vos colis facilement</h2>
            <p className="text-xl text-dark/60">Vous avez un colis à envoyer ? Suivez ces étapes simples</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Étape 1 */}
            <div className="card text-center group hover:shadow-xl transition-all">
              <div className="w-16 h-16 rounded-full bg-gradient-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <Package className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Publiez une annonce</h3>
              <p className="text-dark/70">
                Créez une annonce en décrivant votre colis, le trajet souhaité, 
                les dates et le budget proposé
              </p>
            </div>

            {/* Étape 2 */}
            <div className="card text-center group hover:shadow-xl transition-all">
              <div className="w-16 h-16 rounded-full bg-gradient-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <Search className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Trouvez un voyageur</h3>
              <p className="text-dark/70">
                Parcourez les profils des voyageurs disponibles sur votre trajet 
                ou attendez qu'ils vous contactent
              </p>
            </div>

            {/* Étape 3 */}
            <div className="card text-center group hover:shadow-xl transition-all">
              <div className="w-16 h-16 rounded-full bg-gradient-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Organisez la livraison</h3>
              <p className="text-dark/70">
                Discutez avec le voyageur, convenez des détails de remise et 
                suivez votre colis en temps réel
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pour les Shippers */}
      <section className="py-20 bg-light">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge-info mb-4 inline-block">✈️ Pour les Shippers</span>
            <h2 className="text-4xl font-bold mb-4">Voyagez et gagnez de l'argent</h2>
            <p className="text-xl text-dark/60">Vous voyagez ? Monétisez votre espace bagages disponible</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Étape 1 */}
            <div className="card text-center group hover:shadow-xl transition-all">
              <div className="w-16 h-16 rounded-full bg-gradient-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <Plane className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Annoncez votre voyage</h3>
              <p className="text-dark/70">
                Publiez les détails de votre voyage : trajet, dates, poids disponible 
                et tarif demandé
              </p>
            </div>

            {/* Étape 2 */}
            <div className="card text-center group hover:shadow-xl transition-all">
              <div className="w-16 h-16 rounded-full bg-gradient-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <Users className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Recevez des demandes</h3>
              <p className="text-dark/70">
                Les expéditeurs intéressés vous contactent. Choisissez les colis 
                que vous souhaitez transporter
              </p>
            </div>

            {/* Étape 3 */}
            <div className="card text-center group hover:shadow-xl transition-all">
              <div className="w-16 h-16 rounded-full bg-gradient-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <DollarSign className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Gagnez de l'argent</h3>
              <p className="text-dark/70">
                Récupérez le colis, transportez-le et recevez votre paiement 
                sécurisé après livraison
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-20 bg-white">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Pourquoi choisir ShipperTrip ?</h2>
            <p className="text-xl text-dark/60">La plateforme la plus sûre et la plus simple</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Avantage 1 */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Paiement sécurisé</h3>
                <p className="text-dark/70">
                  Système de paiement protégé avec garantie de remboursement
                </p>
              </div>
            </div>

            {/* Avantage 2 */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Profils vérifiés</h3>
                <p className="text-dark/70">
                  Tous les membres sont vérifiés pour votre sécurité
                </p>
              </div>
            </div>

            {/* Avantage 3 */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Star className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Notation & Avis</h3>
                <p className="text-dark/70">
                  Système d'évaluation transparent pour choisir en confiance
                </p>
              </div>
            </div>

            {/* Avantage 4 */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Chat intégré</h3>
                <p className="text-dark/70">
                  Communiquez directement avec vos partenaires sur la plateforme
                </p>
              </div>
            </div>

            {/* Avantage 5 */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Livraison rapide</h3>
                <p className="text-dark/70">
                  Profitez de délais de livraison réduits grâce aux voyageurs
                </p>
              </div>
            </div>

            {/* Avantage 6 */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Économique</h3>
                <p className="text-dark/70">
                  Des tarifs jusqu'à 50% moins chers que les services traditionnels
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sécurité */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container max-w-4xl mx-auto text-center">
          <Shield className="w-20 h-20 text-primary mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-6">Votre sécurité est notre priorité</h2>
          <p className="text-xl text-dark/70 mb-8">
            Nous mettons en place plusieurs mesures pour garantir des transactions sûres :
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="card">
              <CheckCircle className="w-8 h-8 text-accent mb-4" />
              <h3 className="font-bold text-lg mb-2">Vérification d'identité</h3>
              <p className="text-dark/70">
                Document d'identité obligatoire pour tous les membres
              </p>
            </div>

            <div className="card">
              <CheckCircle className="w-8 h-8 text-accent mb-4" />
              <h3 className="font-bold text-lg mb-2">Assurance colis</h3>
              <p className="text-dark/70">
                Protection jusqu'à 500€ pour tous les envois
              </p>
            </div>

            <div className="card">
              <CheckCircle className="w-8 h-8 text-accent mb-4" />
              <h3 className="font-bold text-lg mb-2">Paiement séquestre</h3>
              <p className="text-dark/70">
                L'argent est bloqué jusqu'à la livraison confirmée
              </p>
            </div>

            <div className="card">
              <CheckCircle className="w-8 h-8 text-accent mb-4" />
              <h3 className="font-bold text-lg mb-2">Support 24/7</h3>
              <p className="text-dark/70">
                Notre équipe disponible à tout moment pour vous aider
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-white">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Prêt à commencer ?</h2>
          <p className="text-xl text-dark/60 mb-8">
            Rejoignez des milliers d'utilisateurs qui font confiance à ShipperTrip
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="btn-primary text-lg px-8 py-4">
              Créer un compte gratuit
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link href="/search" className="btn-secondary text-lg px-8 py-4">
              Explorer les annonces
            </Link>
          </div>

          <p className="text-sm text-dark/60 mt-6">
            Aucune carte bancaire requise • Inscription en 2 minutes
          </p>
        </div>
      </section>
    </div>
  )
}
