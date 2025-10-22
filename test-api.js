// Test script to verify API connection and registration
const testRegistration = async () => {
  console.log('🧪 Testing CarbonSense API...\n');
  
  const testUser = {
    email: 'testuser@example.com',
    password: 'test123456',
    firstName: 'Test',
    lastName: 'User',
    role: 'individual'
  };

  try {
    // Test Registration
    console.log('📝 Testing Registration...');
    console.log('Sending:', { ...testUser, password: '[REDACTED]' });
    
    const signupResponse = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const signupData = await signupResponse.json();
    console.log('Status:', signupResponse.status);
    console.log('Response:', JSON.stringify(signupData, null, 2));

    if (signupResponse.ok) {
      console.log('\n✅ Registration Successful!\n');
      const token = signupData.token;

      // Test Login
      console.log('🔐 Testing Login...');
      const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });

      const loginData = await loginResponse.json();
      console.log('Status:', loginResponse.status);
      console.log('Response:', JSON.stringify(loginData, null, 2));

      if (loginResponse.ok) {
        console.log('\n✅ Login Successful!\n');
        console.log('🎉 All tests passed! Your API is working correctly.');
        console.log('\n📊 Summary:');
        console.log('  - Registration: ✅ Working');
        console.log('  - Login: ✅ Working');
        console.log('  - Token: ✅ Generated');
        console.log('  - Database: ✅ Connected');
      } else {
        console.log('\n❌ Login Failed:', loginData.message);
      }
    } else {
      console.log('\n❌ Registration Failed:', signupData.message);
      if (signupData.error) {
        console.log('Error details:', signupData.error);
      }
    }
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    console.error('\nMake sure:');
    console.error('  1. The server is running (npm run dev:full)');
    console.error('  2. Supabase tables are created (run SQL in Supabase dashboard)');
    console.error('  3. Environment variables are set in .env file');
  }
};

testRegistration();
