import mongoose from 'mongoose';
import Conversation from './src/models/conversation.model';
import Message from './src/models/message.model';
import { User } from './src/models/User';
import dotenv from 'dotenv';

dotenv.config();

const createTestConversations = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/travelship';
    
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Trouver des utilisateurs (non-admin)
    const users = await User.find({ role: { $ne: 'admin' } }).limit(4);
    
    if (users.length < 2) {
      console.log('⚠️  Pas assez d\'utilisateurs (minimum 2 requis)');
      console.log('💡 Créez d\'abord des utilisateurs normaux via l\'inscription');
      process.exit(0);
    }

    console.log(`✅ ${users.length} utilisateurs trouvés`);

    // Vérifier les conversations existantes
    const existingConversations = await Conversation.countDocuments();
    console.log(`📊 Conversations existantes: ${existingConversations}`);

    if (existingConversations > 0) {
      console.log('✅ Des conversations existent déjà !');
      
      // Afficher quelques détails
      const conversations = await Conversation.find()
        .populate('participants', 'name email')
        .limit(5);
      
      console.log('\n📋 Aperçu des conversations:');
      conversations.forEach((conv, idx) => {
        console.log(`  ${idx + 1}. ${conv.participants.map((p: any) => p.name).join(' ↔ ')}`);
      });
      
      const choice = await askQuestion('\n❓ Voulez-vous créer des conversations supplémentaires ? (o/n): ');
      if (choice.toLowerCase() !== 'o') {
        console.log('👋 Terminé!');
        process.exit(0);
      }
    }

    // Créer des conversations de test
    const conversationsToCreate = Math.min(3, Math.floor(users.length / 2));
    console.log(`\n🔄 Création de ${conversationsToCreate} conversations de test...`);

    for (let i = 0; i < conversationsToCreate; i++) {
      const user1 = users[i * 2];
      const user2 = users[i * 2 + 1];

      // Vérifier si la conversation existe déjà
      const existingConv = await Conversation.findOne({
        participants: { $all: [user1._id, user2._id] }
      });

      if (existingConv) {
        console.log(`  ⏭️  Conversation ${user1.name} ↔ ${user2.name} existe déjà`);
        continue;
      }

      // Créer la conversation
      const conversation = await Conversation.create({
        participants: [user1._id, user2._id],
      });

      // Créer quelques messages
      const messages = [
        {
          conversationId: conversation._id,
          sender: user1._id,
          content: `Bonjour ${user2.name} ! Je suis intéressé par votre annonce.`,
          read: true,
        },
        {
          conversationId: conversation._id,
          sender: user2._id,
          content: `Salut ${user1.name} ! Merci de votre intérêt. Que souhaitez-vous savoir ?`,
          read: true,
        },
        {
          conversationId: conversation._id,
          sender: user1._id,
          content: 'Quelles sont vos disponibilités ?',
          read: false,
        },
      ];

      await Message.insertMany(messages);

      // Mettre à jour lastMessage
      conversation.lastMessage = {
        content: messages[messages.length - 1].content,
        senderId: messages[messages.length - 1].sender,
        timestamp: new Date(),
      };
      await conversation.save();

      console.log(`  ✅ Conversation créée: ${user1.name} ↔ ${user2.name} (${messages.length} messages)`);
    }

    // Résumé final
    const totalConversations = await Conversation.countDocuments();
    const totalMessages = await Message.countDocuments();
    
    console.log('\n📊 Résumé:');
    console.log(`  • Total conversations: ${totalConversations}`);
    console.log(`  • Total messages: ${totalMessages}`);
    console.log('\n✅ Terminé avec succès!');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

// Helper pour demander input
function askQuestion(question: string): Promise<string> {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      rl.close();
      resolve(answer);
    });
  });
}

createTestConversations();
