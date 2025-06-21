
'use client';

import { useState, useEffect } from 'react';

export default function TestAuthPage() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, message]);
  };

  const testAuth = async () => {
    setLoading(true);
    setResults([]);

    try {
      // Test 1: Check initial auth state
      addResult('1. Testing /api/auth/me (unauthenticated):');
      let response = await fetch('/api/auth/me', { credentials: 'include' });
      let data = await response.json();
      addResult(`Status: ${response.status}, Response: ${JSON.stringify(data)}`);

      // Test 2: Login
      addResult('2. Testing login:');
      response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        credentials: 'include'
      });
      data = await response.json();
      addResult(`Status: ${response.status}, Response: ${JSON.stringify(data)}`);

      // Test 3: Check auth state after login
      addResult('3. Testing /api/auth/me (after login):');
      response = await fetch('/api/auth/me', { credentials: 'include' });
      data = await response.json();
      addResult(`Status: ${response.status}, Response: ${JSON.stringify(data)}`);

      // Test 4: Test venues endpoint
      addResult('4. Testing /api/venues (authenticated):');
      response = await fetch('/api/venues', { credentials: 'include' });
      data = await response.json();
      addResult(`Status: ${response.status}, Venues: ${data.venues ? data.venues.length : 'Error: ' + JSON.stringify(data)}`);

      addResult('✅ All tests completed!');

    } catch (error: any) {
      addResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Authentication Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Test Results</h2>
            <button
              onClick={testAuth}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Running...' : 'Run Tests Again'}
            </button>
          </div>
          
          <div className="space-y-2">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-2 rounded ${
                  result.startsWith('✅') ? 'bg-green-100 text-green-800' :
                  result.startsWith('❌') ? 'bg-red-100 text-red-800' :
                  result.match(/^\d+\./) ? 'bg-blue-100 text-blue-800 font-semibold' :
                  'bg-gray-100 text-gray-800'
                }`}
              >
                <pre className="whitespace-pre-wrap text-sm">{result}</pre>
              </div>
            ))}
            {loading && (
              <div className="p-2 bg-yellow-100 text-yellow-800 rounded">
                Running tests...
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8">
          <a
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
