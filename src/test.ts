import http from 'http';

interface TestCase {
  name: string;
  body: { email?: string | null; phoneNumber?: string | null };
  expectedStatusCode: number;
}

const testCases: TestCase[] = [
  {
    name: 'New customer with email and phone',
    body: { email: 'lorraine@hillvalley.edu', phoneNumber: '123456' },
    expectedStatusCode: 200,
  },
  {
    name: 'Same phone number with new email',
    body: { email: 'mcfly@hillvalley.edu', phoneNumber: '123456' },
    expectedStatusCode: 200,
  },
  {
    name: 'Only phone number',
    body: { email: null, phoneNumber: '123456' },
    expectedStatusCode: 200,
  },
  {
    name: 'Only email',
    body: { email: 'lorraine@hillvalley.edu', phoneNumber: null },
    expectedStatusCode: 200,
  },
  {
    name: 'Missing both email and phone',
    body: { email: null, phoneNumber: null },
    expectedStatusCode: 400,
  },
];

const makeRequest = (body: object): Promise<any> => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/identify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: data ? JSON.parse(data) : null,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(JSON.stringify(body));
    req.end();
  });
};

const runTests = async () => {
  console.log('🧪 Starting API tests...\n');

  for (const testCase of testCases) {
    try {
      const response = await makeRequest(testCase.body);
      const passed = response.statusCode === testCase.expectedStatusCode;

      console.log(`${passed ? '✅' : '❌'} ${testCase.name}`);
      console.log(`   Status: ${response.statusCode} (expected: ${testCase.expectedStatusCode})`);
      if (response.body) {
        console.log(`   Response: ${JSON.stringify(response.body, null, 2)}`);
      }
      console.log();
    } catch (error) {
      console.log(`❌ ${testCase.name}`);
      console.log(`   Error: ${(error as Error).message}\n`);
    }
  }

  console.log('✅ Tests completed!');
};

runTests();
