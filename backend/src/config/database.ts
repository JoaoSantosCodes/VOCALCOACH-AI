import mongoose from 'mongoose';
import { logInfo, logError } from './logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vocalcoach_ai';

// Configurações do Mongoose (removidas opções obsoletas)
const mongooseOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Função para conectar ao MongoDB
export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    
    logInfo('✅ Conectado ao MongoDB com sucesso', {
      uri: MONGODB_URI.replace(/\/\/.*@/, '//***:***@'), // Mascarar credenciais
      database: mongoose.connection.name
    });

    // Configurar listeners de eventos
    mongoose.connection.on('error', (error) => {
      logError('Erro na conexão MongoDB', error);
    });

    mongoose.connection.on('disconnected', () => {
      logInfo('MongoDB desconectado');
    });

    mongoose.connection.on('reconnected', () => {
      logInfo('MongoDB reconectado');
    });

  } catch (error) {
    logError('Falha ao conectar ao MongoDB', error as Error);
    // Não encerrar o processo, apenas logar o erro
    logInfo('Continuando sem conexão com MongoDB...');
  }
};

// Função para desconectar do MongoDB
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logInfo('MongoDB desconectado com sucesso');
  } catch (error) {
    logError('Erro ao desconectar do MongoDB', error as Error);
  }
};

// Função para verificar status da conexão
export const getDatabaseStatus = () => {
  return {
    connected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    database: mongoose.connection.name,
    host: mongoose.connection.host,
    port: mongoose.connection.port
  };
};

export default mongoose; 