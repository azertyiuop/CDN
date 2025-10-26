import React from 'react';
import { Shield, ArrowLeft, AlertTriangle, Mail, FileText, CheckCircle, User, Clock } from 'lucide-react'


interface DMCAPageProps {
  onBack: () => void;
}

const DMCAPage: React.FC<DMCAPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          Retour
        </button>

        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-slate-800 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">DMCA Copyright Policy</h1>
              <p className="text-slate-400 mt-1">Digital Millennium Copyright Act</p>
            </div>
          </div>

          <div className="space-y-8 text-slate-300">
            <section className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-7 w-7 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold text-red-400 mb-3">Avertissement Important</h3>
                  <p className="leading-relaxed">
                    Nous prenons la protection des droits d'auteur très au sérieux. Si vous estimez que votre contenu
                    protégé par le droit d'auteur a été utilisé de manière illégale sur notre plateforme, veuillez
                    suivre la procédure détaillée ci-dessous pour soumettre une réclamation DMCA.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
                <FileText className="h-7 w-7 text-cyan-400" />
                1. Notre Politique DMCA
              </h2>
              <p className="mb-4 leading-relaxed">
                Conformément au Digital Millennium Copyright Act (DMCA) de 1998, nous répondons promptement aux
                notifications de violations présumées de droits d'auteur. Si votre matériel protégé a été publié
                sur notre site sans autorisation, vous pouvez soumettre une notification officielle.
              </p>
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <p className="font-semibold text-white mb-3">Nos engagements :</p>
                <div className="space-y-3">
                  {[
                    'Examiner toutes les réclamations DMCA dans les 24 heures',
                    'Retirer le contenu en infraction dès confirmation de la violation',
                    'Notifier immédiatement l\'utilisateur concerné',
                    'Prendre des mesures strictes contre les récidivistes',
                    'Maintenir un registre transparent des actions entreprises'
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-white mb-4">2. Comment Soumettre une Réclamation DMCA</h2>
              <p className="mb-6 leading-relaxed">
                Pour que votre notification soit valide et conforme aux exigences légales du DMCA, elle doit
                obligatoirement inclure les éléments suivants :
              </p>

              <div className="space-y-4">
                {[
                  {
                    letter: 'a',
                    title: 'Identification du Contenu Protégé',
                    description: 'Une description claire et détaillée de l\'œuvre protégée par le droit d\'auteur dont vous affirmez qu\'elle a été violée. Incluez des liens vers l\'œuvre originale si disponible.'
                  },
                  {
                    letter: 'b',
                    title: 'Identification du Contenu en Infraction',
                    description: 'L\'URL exacte ou une description détaillée permettant de localiser précisément le contenu prétendument contrefait sur notre plateforme. Plus l\'information est précise, plus rapide sera notre intervention.'
                  },
                  {
                    letter: 'c',
                    title: 'Vos Coordonnées Complètes',
                    description: 'Nom complet, adresse postale, numéro de téléphone et adresse e-mail valide. Ces informations sont essentielles pour traiter votre demande et vous contacter si nécessaire.'
                  },
                  {
                    letter: 'd',
                    title: 'Déclaration de Bonne Foi',
                    description: 'Une déclaration affirmant que vous estimez de bonne foi que l\'utilisation du contenu contesté n\'est pas autorisée par le titulaire des droits d\'auteur, son agent ou la loi.'
                  },
                  {
                    letter: 'e',
                    title: 'Déclaration d\'Exactitude',
                    description: 'Une déclaration, sous peine de parjure selon les lois applicables, attestant que les informations fournies dans votre notification sont exactes et que vous êtes le titulaire des droits d\'auteur ou autorisé à agir en son nom.'
                  },
                  {
                    letter: 'f',
                    title: 'Signature Électronique ou Physique',
                    description: 'Une signature physique ou électronique du titulaire des droits d\'auteur ou d\'une personne autorisée à agir pour son compte.'
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-cyan-500/50 transition-colors">
                    <h3 className="font-bold text-cyan-400 mb-3 text-lg">{item.letter}) {item.title}</h3>
                    <p className="text-slate-300 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
                <Mail className="h-7 w-7 text-cyan-400" />
                3. Envoi de votre Réclamation
              </h2>
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-8 shadow-lg">
                <p className="mb-6 text-lg">
                  Vous pouvez soumettre votre notification DMCA par les moyens suivants :
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                    <Mail className="h-8 w-8 text-cyan-400 mb-4" />
                    <p className="font-bold text-white mb-2">Par Email (Recommandé)</p>
                    <p className="text-cyan-400 text-lg font-mono">dmca@abdstream.com</p>
                    <p className="text-sm text-slate-400 mt-3">Réponse sous 24h ouvrées</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                    <FileText className="h-8 w-8 text-cyan-400 mb-4" />
                    <p className="font-bold text-white mb-2">Par Courrier Postal</p>
                    <div className="text-slate-300 space-y-1">
                      <p>ABD Stream Legal Department</p>
                      <p>123 Avenue de la République</p>
                      <p>75001 Paris, France</p>
                      <p className="text-sm text-slate-400 mt-3">À l'attention de : Agent DMCA</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-white mb-4">4. Procédure de Contre-Notification</h2>
              <p className="mb-4 leading-relaxed">
                Si vous estimez que votre contenu a été retiré par erreur ou suite à une identification erronée,
                vous avez le droit de soumettre une contre-notification. Cette dernière doit impérativement contenir :
              </p>
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <ul className="space-y-3">
                  {[
                    'Votre signature physique ou électronique',
                    'L\'identification précise du contenu retiré et son emplacement avant le retrait',
                    'Une déclaration sous peine de parjure affirmant de bonne foi que le contenu a été retiré ou désactivé par erreur ou identification erronée',
                    'Vos nom, adresse, numéro de téléphone et adresse e-mail',
                    'Une déclaration de consentement à la juridiction du tribunal fédéral du district judiciaire dans lequel votre adresse est située',
                    'Une déclaration d\'acceptation de la signification d\'une assignation de la part de la personne ayant fourni la notification originale'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-cyan-400 text-sm font-bold">{index + 1}</span>
                      </div>
                      <span className="text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
                <User className="h-7 w-7 text-orange-400" />
                5. Politique envers les Récidivistes
              </h2>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6">
                <p className="leading-relaxed mb-4">
                  Conformément aux dispositions du DMCA, nous appliquons une politique stricte concernant les
                  utilisateurs qui enfreignent de manière répétée les droits d'auteur d'autrui.
                </p>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-orange-500/20">
                  <p className="font-semibold text-orange-400 mb-2">Mesures progressives :</p>
                  <ul className="space-y-2 text-slate-300">
                    <li>1ère infraction : Avertissement et retrait du contenu</li>
                    <li>2ème infraction : Suspension temporaire du compte (7 jours)</li>
                    <li>3ème infraction : Suspension prolongée (30 jours)</li>
                    <li>Infractions multiples : Fermeture définitive du compte</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-white mb-4">6. Fausses Réclamations</h2>
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-red-400 text-lg mb-3">Avertissement Juridique Important</p>
                    <p className="leading-relaxed mb-4">
                      En vertu de l'article 512(f) du DMCA, toute personne qui sciemment déclare faussement qu'un
                      matériel ou une activité constitue une violation peut être tenue responsable de dommages et
                      intérêts, incluant les frais juridiques et les coûts de défense.
                    </p>
                    <p className="text-slate-300 leading-relaxed">
                      Avant de soumettre une réclamation DMCA, assurez-vous que vous disposez d'une base juridique
                      légitime et que toutes les informations fournies sont exactes et véridiques. Les fausses
                      déclarations peuvent entraîner des poursuites judiciaires sérieuses.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
                <Clock className="h-7 w-7 text-green-400" />
                7. Délais de Traitement
              </h2>
              <p className="mb-6 leading-relaxed">
                Nous nous engageons à traiter les notifications DMCA avec la plus grande diligence selon le
                calendrier suivant :
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-5">
                  <p className="font-bold text-white mb-2">Accusé de réception</p>
                  <p className="text-cyan-400 text-lg font-semibold">Sous 24 heures</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5">
                  <p className="font-bold text-white mb-2">Examen préliminaire</p>
                  <p className="text-blue-400 text-lg font-semibold">24-48 heures</p>
                </div>
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-5">
                  <p className="font-bold text-white mb-2">Examen approfondi</p>
                  <p className="text-indigo-400 text-lg font-semibold">2-5 jours ouvrables</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5">
                  <p className="font-bold text-white mb-2">Action corrective</p>
                  <p className="text-green-400 text-lg font-semibold">Immédiate après validation</p>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-5">
                  <p className="font-bold text-white mb-2">Notification à l'utilisateur</p>
                  <p className="text-orange-400 text-lg font-semibold">Sous 24 heures après action</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-5">
                  <p className="font-bold text-white mb-2">Suivi final</p>
                  <p className="text-purple-400 text-lg font-semibold">7 jours après résolution</p>
                </div>
              </div>
            </section>

            <section className="pt-8 border-t border-slate-700">
              <div className="bg-slate-800/30 rounded-xl p-6 text-center">
                <p className="text-slate-400 leading-relaxed">
                  Cette politique DMCA est effective depuis le <span className="text-white font-semibold">{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span> et
                  peut être modifiée à tout moment pour rester conforme aux évolutions législatives et aux meilleures
                  pratiques de l'industrie.
                </p>
                <p className="text-slate-500 text-sm mt-4">
                  Nous vous encourageons à consulter régulièrement cette page pour vous tenir informé de nos pratiques
                  et de toute mise à jour éventuelle.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DMCAPage;
