import React, { useState } from 'react';
import { login } from '../services/api'; // Ensure this is implemented correctly
import { useNavigate } from 'react-router-dom';

function Login() {
  const [isAdmin, setIsAdmin] = useState(false); // Tracks if admin login is selected
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const navigate = useNavigate();

  const handleAdminClick = () => {
    setIsAdmin(true); // Show admin login form
  };

  const handleCustomerClick = () => {
    navigate('/customer'); // Directly navigate to the Customer dashboard
  };

  const handleLoginSubmit = async () => {
    try {
      const response = await login({ username, password }); // API call for login
      
      if (response && response.success) {
        setFeedbackMessage({ 
          type: 'success', 
          text: 'Login successful! Redirecting to Admin Dashboard...' });
        setTimeout(() => navigate('/admin'), 2000); // Delay the navigation for feedback message
      } else {
        setFeedbackMessage({ type: 'error', text: 'Invalid credentials, please try again.' });
      }

    } catch (error) {
      setFeedbackMessage({ type: 'error', text: 'An error occurred during login. Please try again later.' });
      console.error(error);
      setTimeout(() => {
        setFeedbackMessage(null); // Clear feedback message after 2 seconds
      }, 2000)
    }
  };

  return (
    <div className="login-container">
      <h1 className='login-heading'>Welcome to the ticket system !</h1>
      <div>

        {/* Feedback Message */}
        {feedbackMessage && (
          <div className={`feedback-message ${feedbackMessage.type} show`}>
            {feedbackMessage.text}
          </div>
        )}

        {!isAdmin ? (
          <div className="role-selection">
            <h2 className="role-selection">How would you like to use the system?</h2>
            <div className="button-group">
              <button onClick={handleAdminClick}>Admin</button>
              <button onClick={handleCustomerClick}>Customer</button>
            </div>
          </div>
        ) : (
          <div>
            <h2>Admin Login</h2>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="button-group">
              <button onClick={handleLoginSubmit}>Submit</button>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;