import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/Auth';

export const AuthPanel: React.FC = () => {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegister) {
        const res = await api.post('/auth/register', { name, email, password, role });
        alert(res.data.message + ' Account setup complete! Switching to Login.');
        setIsRegister(false);
      } else {
        const res = await api.post('/auth/login', { email, password });
        if (res.data.status === 'success') {
          login(res.data.data.token, res.data.data.user);
        }
      }
    } catch (err: any) {
      alert('Action Error: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '300px', fontFamily: 'sans-serif' }}>
      <h2>{isRegister ? 'Create Account Profile' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        {isRegister && (
          <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required style={{ marginBottom: '10px', width: '100%' }} />
        )}
        <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required style={{ marginBottom: '10px', width: '100%' }} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ marginBottom: '10px', width: '100%' }} />
        
        {isRegister && (
          <div style={{ marginBottom: '10px' }}>
            <label>Assigned Role: </label>
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="developer">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        )}

        <button type="submit" style={{ width: '100%', padding: '5px' }}>{isRegister ? 'Register Account' : 'Login'}</button>
      </form>
      <p style={{ fontSize: '13px' }}>
        <span style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Already have an account? Sign In' : 'New here? Register a profile'}
        </span>
      </p>
    </div>
  );
};
