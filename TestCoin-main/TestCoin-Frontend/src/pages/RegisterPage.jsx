import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa'; 
import { useNavigate } from 'react-router-dom';
import { register } from '../services/testcoinApi';
import '../styles/RegisterPage.css';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError('Failed to register. Please try again.'); 
    }
  };

  return (
    <div className="page-container">
      <div className="register-page">
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <div className="form-group input-with-icon">
            <FaUser className="input-icon" /> 
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group input-with-icon">
            <FaEnvelope className="input-icon" /> 
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group input-with-icon">
            <FaLock className="input-icon" /> 
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>
          <button type="submit">Register</button>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
