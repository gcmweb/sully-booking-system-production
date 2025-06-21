const { testConnection } = require('./lib/db');

exports.handler = async (event, context) => {
  console.log('Health check endpoint called');
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing'
      }
    };

    // Test database connection
    console.log('Testing database connection...');
    const dbHealthy = await testConnection();
    healthData.database = {
      status: dbHealthy ? 'connected' : 'disconnected',
      tested: true
    };

    const statusCode = dbHealthy ? 200 : 503;
    
    console.log('Health check completed:', healthData);
    
    return {
      statusCode,
      headers,
      body: JSON.stringify(healthData, null, 2)
    };
  } catch (error) {
    console.error('Health check error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        database: {
          status: 'error',
          tested: false
        }
      }, null, 2)
    };
  }
};