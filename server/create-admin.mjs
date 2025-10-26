import Database from './lib/database.mjs';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

async function createAdminAccount() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   🔐 CRÉATION AUTOMATIQUE DE COMPTE ADMINISTRATEUR');
  console.log('═══════════════════════════════════════════════════════════\n');

  const db = new Database();

  try {
    // Attendre que la DB soit initialisée
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Générer des identifiants automatiquement
    const username = 'admin';
    const password = crypto.randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);

    // Vérifier si le compte admin existe déjà
    const existingUser = await db.findUserByUsername(username);
    if (existingUser) {
      console.log('⚠️  Un compte admin existe déjà !');
      console.log('\n📋 IDENTIFIANTS EXISTANTS :');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`   Nom d'utilisateur : ${username}`);
      console.log(`   Mot de passe      : [déjà configuré]`);
      console.log('═══════════════════════════════════════════════════════════\n');
      console.log('💡 Si vous avez oublié le mot de passe, supprimez le compte :');
      console.log('   cd server && sqlite3 data/app.db');
      console.log('   DELETE FROM users WHERE username = \'admin\';');
      console.log('   .quit\n');
      console.log('   Puis relancez ce script.\n');
      db.close();
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    await db.createUser({
      id: userId,
      username: username,
      passwordHash,
      role: 'admin'
    });

    console.log('✅ Compte administrateur créé avec succès !\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📋 IDENTIFIANTS À UTILISER SUR LE SITE :');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`   Nom d'utilisateur : ${username}`);
    console.log(`   Mot de passe      : ${password}`);
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('⚠️  IMPORTANT : Copiez ces identifiants maintenant !');
    console.log('    Le mot de passe ne sera plus affiché après.');
    console.log('\n💡 Utilisez ces identifiants pour vous connecter sur :');
    console.log('    http://localhost:5173\n');
    console.log('🔒 Une fois connecté, le panel admin apparaîtra');
    console.log('    automatiquement dans la barre de navigation.\n');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Erreur lors de la création du compte:', error);
    console.error(error.stack);
  } finally {
    db.close();
    process.exit(0);
  }
}

// Gérer les erreurs non capturées
process.on('unhandledRejection', (error) => {
  console.error('❌ Erreur non gérée:', error);
  process.exit(1);
});

createAdminAccount();
