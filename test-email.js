// Test script for email sending
require('dotenv').config();
const { sendPasswordResetEmail } = require('./server/services/email');

const testEmail = async () => {
  console.log('🧪 Test d\'envoi d\'email...\n');
  console.log('Configuration SMTP:');
  console.log('- Host:', process.env.SMTP_HOST);
  console.log('- Port:', process.env.SMTP_PORT);
  console.log('- User:', process.env.SMTP_USER);
  console.log('- From:', process.env.SMTP_FROM);
  console.log('- Pass configured:', process.env.SMTP_PASS ? '✓ Oui' : '✗ Non');
  console.log('\n');

  try {
    const testEmail = process.env.SMTP_USER; // Envoyer à votre propre adresse pour tester
    const testToken = 'test-token-123456789';
    const testUsername = 'TestUser';

    console.log(`📧 Envoi d'un email de test à: ${testEmail}\n`);
    
    await sendPasswordResetEmail(testEmail, testToken, testUsername);
    
    console.log('\n✅ Test terminé avec succès!');
    console.log('\n📬 Vérifiez votre boîte de réception (et les spams) à l\'adresse:', testEmail);
    
  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error);
    console.error('\nDétails de l\'erreur:', error.message);
    if (error.response) {
      console.error('Réponse SMTP:', error.response);
    }
  }
};

testEmail();
