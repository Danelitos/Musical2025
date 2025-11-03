const { MongoClient, ServerApiVersion } = require('mongodb');

/**
 * Configuración de MongoDB para el Musical "En Belén de Judá"
 * 
 * Este módulo gestiona la conexión a MongoDB Atlas y proporciona
 * acceso a la base de datos para almacenar transacciones y gestionar disponibilidad.
 */

// URI de conexión - debe estar en variables de entorno
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Danel:pueblerine2025@enbelendejuda.w64tzdv.mongodb.net/?appName=EnBelenDeJuda';
const DB_NAME = 'musical-belen-juda';

// Cliente de MongoDB (singleton)
let client = null;
let db = null;

/**
 * Configuración del cliente de MongoDB
 */
const clientOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 10, // Máximo de conexiones en el pool
  minPoolSize: 2,  // Mínimo de conexiones mantenidas
  connectTimeoutMS: 10000, // Timeout de conexión: 10 segundos
  socketTimeoutMS: 45000,  // Timeout de socket: 45 segundos
};

/**
 * Conecta a MongoDB Atlas
 * Utiliza un patrón singleton para reutilizar la conexión
 * 
 * @returns {Promise<MongoClient>} Cliente de MongoDB conectado
 */
async function conectarMongoDB() {
  if (client && db) {
    // Reutilizar conexión existente
    return client;
  }

  try {
    console.log('🔌 Conectando a MongoDB Atlas...');
    
    // Crear nuevo cliente
    client = new MongoClient(MONGODB_URI, clientOptions);
    
    // Conectar
    await client.connect();
    
    // Verificar conexión con ping
    await client.db('admin').command({ ping: 1 });
    
    // Obtener referencia a la base de datos
    db = client.db(DB_NAME);
    
    console.log(`✅ Conectado exitosamente a MongoDB Atlas`);
    console.log(`   Base de datos: ${DB_NAME}`);
    
    return client;
    
  } catch (error) {
    console.error('❌ ERROR conectando a MongoDB:', error.message);
    
    // Limpiar referencias en caso de error
    client = null;
    db = null;
    
    throw error;
  }
}

/**
 * Obtiene la referencia a la base de datos
 * Se asegura de que la conexión esté establecida
 * 
 * @returns {Promise<Db>} Base de datos de MongoDB
 */
async function obtenerDB() {
  if (!db) {
    await conectarMongoDB();
  }
  return db;
}

/**
 * Cierra la conexión a MongoDB
 * Se debe llamar al cerrar el servidor
 */
async function cerrarConexion() {
  if (client) {
    try {
      await client.close();
      console.log('🔌 Conexión a MongoDB cerrada');
      client = null;
      db = null;
    } catch (error) {
      console.error('❌ Error cerrando conexión a MongoDB:', error.message);
    }
  }
}

/**
 * Verifica el estado de la conexión
 * 
 * @returns {boolean} true si está conectado, false si no
 */
function estaConectado() {
  return client !== null && db !== null;
}

// Manejar cierre graceful del proceso
process.on('SIGINT', async () => {
  await cerrarConexion();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await cerrarConexion();
  process.exit(0);
});

module.exports = {
  conectarMongoDB,
  obtenerDB,
  cerrarConexion,
  estaConectado,
  DB_NAME
};
