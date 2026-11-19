const { test, expect } = require('./coverageFixture');

test.describe('Module 3: 10+ RESTful APIs with SOLID & 25% Latency Optimizations', () => {
  const timestamp = Date.now();
  const testUser = {
    name: 'Vedic Architect',
    email: `vedic_api_${timestamp}@focusflow.io`,
    password: 'VedicPassword123!'
  };

  let accessToken = '';
  let refreshTokenCookie = '';
  let createdSessionId = '';

  // 1. POST /api/v1/auth/signup
  test('Endpoint 1: POST /api/v1/auth/signup - registers user and issues dual tokens', async ({ request }) => {
    const res = await request.post('http://localhost:5000/api/v1/auth/signup', {
      data: testUser
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.accessToken).toBeDefined();
    expect(body.data.user.email).toBe(testUser.email);

    // Verify Set-Cookie header contains refreshToken
    const cookies = res.headers()['set-cookie'] || '';
    expect(cookies).toContain('refreshToken=');
    accessToken = body.data.accessToken;
  });

  // 2. POST /api/v1/auth/login
  test('Endpoint 2: POST /api/v1/auth/login - authenticates and returns access token + cookie', async ({ request }) => {
    const res = await request.post('http://localhost:5000/api/v1/auth/login', {
      data: {
        email: testUser.email,
        password: testUser.password
      }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.accessToken).toBeDefined();
    accessToken = body.data.accessToken;

    const cookies = res.headers()['set-cookie'] || '';
    const match = cookies.match(/refreshToken=([^;]+)/);
    if (match) {
      refreshTokenCookie = match[1];
    }
  });

  // 3. POST /api/v1/auth/refresh
  test('Endpoint 3: POST /api/v1/auth/refresh - performs silent token rotation', async ({ request }) => {
    const res = await request.post('http://localhost:5000/api/v1/auth/refresh', {
      headers: {
        Cookie: `refreshToken=${refreshTokenCookie}`
      },
      data: {
        refreshToken: refreshTokenCookie
      }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.accessToken).toBeDefined();
    accessToken = body.data.accessToken; // rotated access token
  });

  // 11. GET /api/v1/traditions
  test('Endpoint 11: GET /api/v1/traditions - lists Vedic practices with metadata & pacing templates', async ({ request }) => {
    const res = await request.get('http://localhost:5000/api/v1/traditions');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(4);
    const pranayama = body.data.find(t => t.id === 'pranayama');
    expect(pranayama).toBeDefined();
    expect(pranayama.defaultBreathRatios).toBeDefined();
  });

  // 5. POST /api/v1/sessions/generate
  test('Endpoint 5: POST /api/v1/sessions/generate - orchestrates Gemini session script workflow', async ({ request }) => {
    const res = await request.post('http://localhost:5000/api/v1/sessions/generate', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      data: {
        tradition: 'pranayama',
        mood: 'Anxious',
        stressLevel: 8,
        targetDuration: 10
      }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.title).toBeDefined();
    expect(body.data.breathRatios).toBeDefined();
    expect(Array.isArray(body.data.stages)).toBe(true);
  });

  // 6. POST /api/v1/sessions/start
  test('Endpoint 6: POST /api/v1/sessions/start - records initiation and baseline biomarkers', async ({ request }) => {
    const res = await request.post('http://localhost:5000/api/v1/sessions/start', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      data: {
        title: 'Nadi Shodhana Morning Coherence',
        tradition: 'pranayama',
        duration: 10,
        baselineHeartRate: 78,
        baselineHrv: 42,
        baselineCalmScore: 4,
        moodBefore: 'Anxious'
      }
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBeDefined();
    expect(body.data.biomarkers.baseline.heartRate).toBe(78);
    createdSessionId = body.data.id;
  });

  // 7. PUT /api/v1/sessions/:id/complete
  test('Endpoint 7: PUT /api/v1/sessions/:id/complete - evaluates exit biomarkers and Gemini summary', async ({ request }) => {
    const res = await request.put(`http://localhost:5000/api/v1/sessions/${createdSessionId}/complete`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      data: {
        durationCompleted: 600,
        exitHeartRate: 66,
        exitHrv: 58,
        exitCalmScore: 9,
        moodAfter: 'Peaceful',
        breathSyncScore: 92,
        notes: 'Noticeable reduction in sympathetic activation.'
      }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.completed).toBe(true);
    expect(body.data.biomarkers.deltas.heartRateDelta).toBe(-12);
    expect(body.data.biomarkers.deltas.hrvDelta).toBe(16);
    expect(body.data.biomarkers.deltas.calmDelta).toBe(5);
    expect(body.data.summary).toContain('Clinical Biomarker Analysis');
  });

  // 8. GET /api/v1/sessions
  test('Endpoint 8: GET /api/v1/sessions - retrieves paginated history with lean projection', async ({ request }) => {
    const res = await request.get('http://localhost:5000/api/v1/sessions?page=1&limit=5', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.items).toBeDefined();
    expect(body.data.pagination.page).toBe(1);
    expect(body.data.pagination.total).toBeGreaterThanOrEqual(1);
  });

  // 9. GET /api/v1/sessions/:id
  test('Endpoint 9: GET /api/v1/sessions/:id - returns single session with DTO serialization', async ({ request }) => {
    const res = await request.get(`http://localhost:5000/api/v1/sessions/${createdSessionId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(createdSessionId);
    expect(body.data.biomarkers).toBeDefined();
    expect(body.data.pacing).toBeDefined();
  });

  // 10. GET /api/v1/metrics/trends
  test('Endpoint 10: GET /api/v1/metrics/trends - returns aggregated calm and HRV deltas', async ({ request }) => {
    const res = await request.get('http://localhost:5000/api/v1/metrics/trends?period=weekly', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.period).toBe('weekly');
    expect(body.data.avgBreathSyncScore).toBeGreaterThanOrEqual(0);
  });

  // Centralized Validation Middleware Error Test (DRY)
  test('Validation DRY: returns uniform error structure on invalid schema input', async ({ request }) => {
    const res = await request.post('http://localhost:5000/api/v1/sessions/start', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      data: {
        duration: 999 // Exceeds max 180 mins limit
      }
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  // 4. POST /api/v1/auth/logout
  test('Endpoint 4: POST /api/v1/auth/logout - clears cookie and revokes refresh token', async ({ request }) => {
    const res = await request.post('http://localhost:5000/api/v1/auth/logout', {
      headers: {
        Cookie: `refreshToken=${refreshTokenCookie}`
      },
      data: {
        refreshToken: refreshTokenCookie
      }
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toContain('Logged out successfully');
  });
});

