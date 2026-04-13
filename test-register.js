import axios from 'axios';

// Test registration
const testRegister = async () => {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/register', {
            username: 'testuser123',
            email: 'test@example.com',
            password: 'password123',
            confirmPassword: 'password123'
        });
        console.log('✅ Registration successful:', response.data);
    } catch (error) {
        console.error('❌ Registration failed:', error.response?.data || error.message);
    }
};

testRegister();
