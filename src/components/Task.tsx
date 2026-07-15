import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { io } from 'socket.io-client';

export const TaskWorkspace: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [liveAlert, setLiveAlert] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      const endpoint = search ? '/tasks/search' : '/tasks';
      const response = await api.get(endpoint, {
        params: {
          page,
          limit: 10,
          ...(search && { q: search }),
          ...(statusFilter && { status: statusFilter }),
          ...(priorityFilter && { priority: Number(priorityFilter) }),
        },
      });
      setTasks(response.data.data);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err) {
      console.error('Failed to compile data grid metrics:', err);
    }
  }, [page, search, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000');
    
    socket.on('task_updated', (event: any) => {
      setLiveAlert(`🔔 Live Event: A task has been ${event.action}! Auto-syncing rows...`);
      fetchTasks();
      setTimeout(() => setLiveAlert(''), 5000);
    });

    return () => { socket.disconnect(); };
  }, [fetchTasks]);

  const handleStatusUpdate = async (taskId: string, currentStatus: string) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: currentStatus });
    } catch (err: any) {
      alert('Action Blocked: ' + (err.response?.data?.message || err.message));
      fetchTasks();
    }
  };

  return (
    <div>
      <h2>List of Tasks</h2>
      {liveAlert && <div style={{ color: 'green', fontWeight: 'bold', margin: '10px 0' }}>{liveAlert}</div>}
      
      <div style={{ background: '#eaeaea', padding: '12px', marginBottom: '15px' }}>
        <input type="text" placeholder="Search title/desc..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{ marginLeft: '10px' }}>
          <option value="">All Statuses</option>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1); }} style={{ marginLeft: '10px' }}>
          <option value="">All Priorities</option>
          <option value="1">1 - High</option>
          <option value="2">2 - Medium</option>
          <option value="3">3 - Low</option>
        </select>
      </div>

      <table border={1} cellPadding={6} style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
            <th>Title</th><th>Description</th><th>Priority</th><th>Status Control</th><th>Assigned User</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 ? (
            <tr><td colSpan={5}>No records matched query constraints.</td></tr>
          ) : (
            tasks.map((task: any) => (
              <tr key={task._id}>
                <td><strong>{task.title}</strong></td>
                <td>{task.description || '-'}</td>
                <td>{task.priority}</td>
                <td>
                  <select value={task.status} onChange={e => handleStatusUpdate(task._id, e.target.value)}>
                    <option value="todo">todo</option>
                    <option value="in-progress">in-progress</option>
                    <option value="done">done</option>
                  </select>
                </td>
                <td>{task.assignedTo?.name || 'Unassigned'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div style={{ marginTop: '15px' }}>
        <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>« Prev</button>
        <span style={{ margin: '0 10px' }}> Page <strong>{page}</strong> of {totalPages} </span>
        <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}>Next »</button>
      </div>
    </div>
  );
};
