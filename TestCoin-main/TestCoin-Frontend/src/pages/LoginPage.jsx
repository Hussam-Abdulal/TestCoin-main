import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa'; 
import { login } from '../services/testcoinApi';
import '../styles/LoginPage.css';  

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('wallet', JSON.stringify(data.wallet));
      navigate('/transactions');
    } catch (error) {
      setError('Invalid email or password');
    }
  };

  const handleRegisterRedirect = () => {
    navigate('/register');
  };

  return (
    <div className="page-container">
      <div className="login-page">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <div className="input-with-icon">
              <FaUser className="input-icon" /> 
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email"
              />
            </div>
          </div>
          <div className="form-group">
            <div className="input-with-icon">
              <FaLock className="input-icon" /> 
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
              />
            </div>
          </div>
          <button type="submit">Login</button>
          {error && <p className="error">{error}</p>}
        </form>
        <button
          onClick={handleRegisterRedirect}
          className="register-button"
        >
          Not registered? Sign up here
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
