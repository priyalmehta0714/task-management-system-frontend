import React from 'react';
import { AuthProvider, useAuth } from './context/Auth';
import { AuthPanel } from './components/Auth';
import { TaskWorkspace } from './components/Task';

const AppLayoutCoordinator: React.FC = () => {
  const { token, user, logout } = useAuth();

  if (!token) {
    return <AuthPanel />;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Dashboard</h1>
      
      <button onClick={logout} style={{ border: 'none', padding: '6px 12px', cursor: 'pointer' }}>
        Logout
      </button>
      <hr style={{ margin: '20px 0' }} />
      <TaskWorkspace />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppLayoutCoordinator />
    </AuthProvider>
  );
}
