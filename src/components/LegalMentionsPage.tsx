import React from 'react';
import { ArrowLeft, Shield, Scale, Info } from 'lucide-react';

interface LegalMentionsPageProps {
  onBack: () => void;
}

const LegalMentionsPage: React.FC<LegalMentionsPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Retour</span>
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
              <Scale className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Mentions Légales</h1>
              <p className="text-slate-400">ABD Stream Platform</p>
            </div>
          </div>

          <div className="space-y-8 text-slate-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Info className="h-6 w-6 mr-2 text-blue-400" />
                Éditeur du site
              </h2>
              <p className="leading-relaxed">
                ABD Stream est une plateforme de streaming sécurisée et anonyme.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Shield className="h-6 w-6 mr-2 text-green-400" />
                Hébergement
              </h2>
              <p className="leading-relaxed">
                Le site est hébergé de manière sécurisée et conforme aux normes de protection des données.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Protection des données</h2>
              <p className="leading-relaxed mb-4">
                Nous nous engageons à protéger votre vie privée et vos données personnelles. Les données collectées sont limitées au strict nécessaire pour le fonctionnement du service.
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Données anonymisées lors de la connexion</li>
                <li>Pas de tracking ou de revente de données</li>
                <li>Sécurité renforcée des communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Propriété intellectuelle</h2>
              <p className="leading-relaxed">
                L'ensemble des contenus présents sur ce site (textes, images, logos, etc.) sont protégés par les droits de propriété intellectuelle.
              </p>
            </section>

            <section className="bg-slate-800 rounded-xl p-6">
              <p className="text-sm text-slate-400">
                Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalMentionsPage;
