const { query } = require('./lib/db');

exports.handler = async (event, context) => {
  console.log('Bookings endpoint called:', event.httpMethod, event.path);
  
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
    if (event.httpMethod === 'GET') {
      console.log('Fetching all bookings...');
      const result = await query('SELECT * FROM bookings ORDER BY created_at DESC');
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: result.rows,
          count: result.rows.length
        })
      };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      console.log('Creating new booking:', body);
      
      const { name, email, phone, service, date, time, notes } = body;
      
      if (!name || !email || !service || !date || !time) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Missing required fields: name, email, service, date, time'
          })
        };
      }

      const result = await query(
        'INSERT INTO bookings (name, email, phone, service, date, time, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [name, email, phone, service, date, time, notes]
      );

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          data: result.rows[0],
          message: 'Booking created successfully'
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Method not allowed'
      })
    };

  } catch (error) {
    console.error('Bookings endpoint error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error.message
      })
    };
  }
};