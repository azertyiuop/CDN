import React from 'react';
import { Shield, ArrowLeft, TriangleAlert as AlertTriangle, Mail, FileText } from 'lucide-react';

interface DMCAPageProps {
  onBack: () => void;
}

const DMCAPage: React.FC<DMCAPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          Retour
        </button>

        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-800">
          <div className="flex items-center gap-4 mb-8">
            <Shield className="h-12 w-12 text-red-400" />
            <h1 className="text-4xl font-bold">DMCA - Copyright Policy</h1>
          </div>

          <div className="space-y-8 text-slate-300">
            <section className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-red-400 mb-2">Avertissement Important</h3>
                  <p>
                    Nous prenons la protection des droits d'auteur très au sérieux. Si vous pensez que votre contenu
                    protégé par le droit d'auteur a été utilisé de manière illégale sur notre plateforme, veuillez
                    suivre la procédure ci-dessous.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-cyan-400" />
                1. Politique DMCA
              </h2>
              <p className="mb-4">
                Conformément au Digital Millennium Copyright Act (DMCA), nous répondons rapidement aux notifications
                de violations présumées de droits d'auteur qui nous sont signalées. Si votre matériel protégé par le
                droit d'auteur a été publié sur notre site sans autorisation, vous pouvez soumettre une notification
                de violation de droits d'auteur.
              </p>
              <p>
                Nous nous engageons à :
              </p>
              <ul className="list-disc list-inside space-y-2 mt-3 ml-4">
                <li>Examiner toutes les réclamations DMCA dans les 24 heures</li>
                <li>Retirer le contenu en infraction dès confirmation</li>
                <li>Notifier l'utilisateur concerné</li>
                <li>Prendre des mesures contre les récidivistes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Comment soumettre une réclamation DMCA</h2>
              <p className="mb-4">
                Pour soumettre une notification de violation de droits d'auteur, votre réclamation doit inclure les
                informations suivantes :
              </p>

              <div className="bg-slate-800/50 rounded-xl p-6 space-y-4">
                <div>
                  <h3 className="font-bold text-cyan-400 mb-2">a) Identification du contenu protégé</h3>
                  <p className="text-sm">
                    Une description détaillée de l'œuvre protégée par le droit d'auteur que vous estimez avoir été violée.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-cyan-400 mb-2">b) Identification du contenu en infraction</h3>
                  <p className="text-sm">
                    L'URL exacte ou une description détaillée permettant de localiser le contenu prétendument
                    contrefait sur notre site.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-cyan-400 mb-2">c) Vos coordonnées</h3>
                  <p className="text-sm">
                    Nom complet, adresse postale, numéro de téléphone et adresse e-mail.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-cyan-400 mb-2">d) Déclaration de bonne foi</h3>
                  <p className="text-sm">
                    Une déclaration indiquant que vous estimez de bonne foi que l'utilisation du contenu n'est pas
                    autorisée par le titulaire des droits d'auteur.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-cyan-400 mb-2">e) Déclaration d'exactitude</h3>
                  <p className="text-sm">
                    Une déclaration, sous peine de parjure, que les informations fournies sont exactes et que vous
                    êtes le titulaire des droits d'auteur ou autorisé à agir en son nom.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-cyan-400 mb-2">f) Signature</h3>
                  <p className="text-sm">
                    Une signature physique ou électronique du titulaire des droits d'auteur ou de la personne
                    autorisée à agir en son nom.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Mail className="h-6 w-6 text-cyan-400" />
                3. Envoi de votre réclamation
              </h2>
              <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
                <p className="mb-4">
                  Vous pouvez soumettre votre notification DMCA par :
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="font-bold text-white">Email :</p>
                    <p className="text-cyan-400">dmca@votre-site.com</p>
                  </div>
                  <div>
                    <p className="font-bold text-white">Courrier postal :</p>
                    <p>[Votre adresse complète]</p>
                    <p>À l'attention de : Agent DMCA</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Contre-notification</h2>
              <p className="mb-4">
                Si vous pensez que votre contenu a été retiré par erreur ou suite à une identification erronée, vous
                pouvez soumettre une contre-notification contenant :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Votre signature physique ou électronique</li>
                <li>Identification du contenu retiré et son emplacement avant le retrait</li>
                <li>Une déclaration sous peine de parjure que vous estimez de bonne foi que le contenu a été retiré par erreur</li>
                <li>Vos coordonnées complètes</li>
                <li>Votre consentement à la juridiction du tribunal fédéral</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Récidivistes</h2>
              <p>
                Nous nous réservons le droit de suspendre ou de résilier les comptes des utilisateurs qui enfreignent
                de manière répétée les droits d'auteur d'autrui. Les utilisateurs ayant fait l'objet de plusieurs
                notifications DMCA valides verront leur compte définitivement fermé.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Fausses réclamations</h2>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                <p>
                  <strong className="text-orange-400">Avertissement :</strong> Soumettre intentionnellement une fausse
                  réclamation DMCA peut entraîner des poursuites judiciaires et des dommages-intérêts. Assurez-vous que
                  votre réclamation est légitime avant de la soumettre.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Délais de traitement</h2>
              <p>
                Nous nous engageons à traiter les notifications DMCA dans les délais suivants :
              </p>
              <ul className="list-disc list-inside space-y-2 mt-3 ml-4">
                <li><strong>Accusé de réception :</strong> Sous 24 heures</li>
                <li><strong>Examen de la réclamation :</strong> 2-5 jours ouvrables</li>
                <li><strong>Action corrective :</strong> Immédiate après validation</li>
                <li><strong>Notification à l'utilisateur :</strong> Sous 24 heures après l'action</li>
              </ul>
            </section>

            <section className="pt-6 border-t border-slate-700">
              <p className="text-sm text-slate-400">
                Cette politique DMCA est effective depuis le {new Date().toLocaleDateString('fr-FR')} et peut être
                modifiée à tout moment. Nous vous encourageons à consulter régulièrement cette page pour vous tenir
                informé de nos pratiques.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DMCAPage;
