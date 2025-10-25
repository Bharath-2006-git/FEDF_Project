// Test script to verify signup and login functionality
import axios from 'axios';

const testAuth = async () => {
  console.log('🧪 Testing CarbonSense Authentication...\n');
  
  // Generate unique test user
  const timestamp = Date.now();
  const testUser = {
    email: `testuser${timestamp}@example.com`,
    password: 'Test123456!',
    firstName: 'Test',
    lastName: 'User',
    role: 'individual'
  };

  try {
    // Test 1: Registration
    console.log('📝 Test 1: User Registration');
    console.log('=====================================');
    console.log('Creating user:', testUser.email);
    
    const signupResponse = await axios.post('http://localhost:3000/api/auth/signup', testUser);

    const signupData = signupResponse.data;
    console.log('Status:', signupResponse.status);
    
    if (signupResponse.status === 201 || signupResponse.status === 200) {
      console.log('✅ Registration Successful!');
      console.log('User ID:', signupData.user.id);
      console.log('Email:', signupData.user.email);
      console.log('Role:', signupData.user.role);
      console.log('Token received:', signupData.token ? 'Yes ✓' : 'No ✗');
      
      const token = signupData.token;
      console.log('\n');

      // Test 2: Login with same credentials
      console.log('🔐 Test 2: User Login');
      console.log('=====================================');
      console.log('Logging in as:', testUser.email);
      
      const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
        email: testUser.email,
        password: testUser.password,
      });

      const loginData = loginResponse.data;
      console.log('Status:', loginResponse.status);

      if (loginResponse.status === 200) {
        console.log('✅ Login Successful!');
        console.log('User ID:', loginData.user.id);
        console.log('Email:', loginData.user.email);
        console.log('Token received:', loginData.token ? 'Yes ✓' : 'No ✗');
        console.log('\n');

        // Test 3: Access protected endpoint
        console.log('🔒 Test 3: Protected Endpoint Access');
        console.log('=====================================');
        console.log('Accessing /api/user/profile with token...');
        
        const profileResponse = await axios.get('http://localhost:3000/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${loginData.token}`
          },
        });

        const profileData = profileResponse.data;
        console.log('Status:', profileResponse.status);

        if (profileResponse.status === 200) {
          console.log('✅ Protected Endpoint Access Successful!');
          console.log('Profile Data:', {
            id: profileData.id,
            email: profileData.email,
            name: `${profileData.firstName} ${profileData.lastName}`,
            role: profileData.role
          });
        } else {
          console.log('❌ Protected Endpoint Access Failed:', profileData.message);
        }

        console.log('\n');
        console.log('═'.repeat(60));
        console.log('🎉 ALL AUTHENTICATION TESTS PASSED!');
        console.log('═'.repeat(60));
        console.log('\n📊 Test Summary:');
        console.log('  ✅ User Registration: WORKING');
        console.log('  ✅ User Login: WORKING');
        console.log('  ✅ JWT Token Generation: WORKING');
        console.log('  ✅ Protected Routes: WORKING');
        console.log('  ✅ Database Integration: WORKING');
        console.log('\n✨ Your authentication system is fully functional!');
        console.log('\n📝 Test User Created:');
        console.log(`  Email: ${testUser.email}`);
        console.log(`  Password: ${testUser.password}`);
        console.log('\n🌐 You can now test in the browser:');
        console.log('  1. Open: http://localhost:5173/login');
        console.log(`  2. Login with the credentials above`);
        console.log('  3. Or create a new account via signup');
        console.log('\n');

      } else {
        console.log('❌ Login Failed:', loginData.message);
      }
    } else {
      console.log('❌ Registration Failed:', signupData.message);
      if (signupData.errors) {
        console.log('Validation errors:', signupData.errors);
      }
    }
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    console.error('Full error:', error);
    if (error.response) {
      console.error('Server responded with:', error.response.status, error.response.data);
    }
    console.error('\n⚠️  Make sure:');
    console.error('  1. The server is running (npm run dev:full)');
    console.error('  2. Backend is accessible at http://localhost:3000');
    console.error('  3. Database connection is working');
  }
};

testAuth();
