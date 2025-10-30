// Simple test to debug fetch issues
const API_URL = 'http://localhost:3000/api';

async function testSimple() {
  const url = `${API_URL}/emissions/calculate?category=electricity&quantity=100&unit=kWh`;
  console.log('Testing URL:', url);
  
  try {
    const response = await fetch(url);
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const data = await response.json();
    console.log('Response data:', data);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  }
}

testSimple();
