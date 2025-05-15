'use client';

import { useEffect, useState } from 'react';

export default function DebugTasksPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [userTasks, setUserTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [creatingTestData, setCreatingTestData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('user_2x502M006dUDIRHPp4VtLEbBXmf'); // Pre-fill with the user ID from logs

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch task templates
      const templatesRes = await fetch('/api/tasks/templates');
      const templatesData = await templatesRes.json();
      
      if (!templatesRes.ok) {
        throw new Error(templatesData.error || 'Failed to fetch task templates');
      }
      
      console.log('Fetched templates:', templatesData.templates);
      setTemplates(templatesData.templates || []);
      
      // Fetch current user's tasks if userId is available
      if (userId) {
        console.log('Fetching tasks for user:', userId);
        const tasksRes = await fetch(`/api/tasks?userId=${userId}`);
        const tasksData = await tasksRes.json();
        
        console.log('Tasks response:', tasksData);
        
        if (tasksRes.ok) {
          setUserTasks(tasksData.tasks || []);
        } else {
          console.error('Error fetching tasks:', tasksData);
          setError(tasksData.error || 'Failed to fetch tasks');
        }
      }
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTasks = async () => {
    if (!userId) {
      setError('Please enter a user ID');
      return;
    }
    
    try {
      setAssigning(true);
      console.log('Assigning tasks for user:', userId);
      
      const response = await fetch('/api/tasks/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      const data = await response.json();
      console.log('Assign tasks response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign tasks');
      }
      
      // Refresh the data
      await fetchData();
      
    } catch (err) {
      console.error('Error assigning tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to assign tasks');
    } finally {
      setAssigning(false);
    }
  };
  
  const createTestData = async () => {
    if (!userId) {
      setError('Please enter a user ID');
      return;
    }
    
    try {
      setCreatingTestData(true);
      console.log('Creating test data...');
      
      // First, create some test templates if none exist
      if (templates.length === 0) {
        console.log('No templates found, creating test templates...');
        const templatesRes = await fetch('/api/tasks/templates/create-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
        
        const templatesData = await templatesRes.json();
        console.log('Create test templates response:', templatesData);
        
        if (!templatesRes.ok) {
          throw new Error(templatesData.error || 'Failed to create test templates');
        }
        
        // Refresh templates
        await fetchData();
      }
      
      // Now assign tasks
      await handleAssignTasks();
      
    } catch (err) {
      console.error('Error creating test data:', err);
      setError(err instanceof Error ? err.message : 'Failed to create test data');
    } finally {
      setCreatingTestData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  if (loading) {
    return <div className="p-6">Loading task data...</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Task Debug</h1>
        
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">User Tasks</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter User ID"
              className="px-3 py-2 border rounded"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAssignTasks}
                disabled={assigning || !userId}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                {assigning ? 'Assigning...' : 'Assign Tasks'}
              </button>
              <button
                onClick={createTestData}
                disabled={creatingTestData || !userId}
                className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
              >
                {creatingTestData ? 'Creating Test Data...' : 'Create Test Data'}
              </button>
            </div>
          </div>
          
          {userTasks.length > 0 ? (
            <div className="space-y-2">
              <p className="font-medium">User's Tasks ({userTasks.length}):</p>
              <ul className="list-disc pl-5 space-y-1">
                {userTasks.map(task => (
                  <li key={task.id}>
                    {task.title} - {task.is_completed ? '✅' : '❌'}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No tasks assigned to this user.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Available Task Templates</h2>
        {templates.length === 0 ? (
          <div>No task templates found.</div>
        ) : (
          <div className="grid gap-4">
            {templates.map((template) => (
              <div key={template.id} className="p-4 border rounded-lg">
                <h3 className="text-lg font-semibold">{template.title}</h3>
                <p className="text-gray-600">{template.description}</p>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Type: {template.task_type}</p>
                  <p>Reward: {template.reward}</p>
                  <p>Active: {template.is_active ? 'Yes' : 'No'}</p>
                  <p>Created: {new Date(template.created_at).toLocaleString()}</p>
                  {template.expires_at && (
                    <p>Expires: {new Date(template.expires_at).toLocaleString()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {error && (
        <div className="p-4 text-red-500 bg-red-50 rounded">
          Error: {error}
        </div>
      )}
    </div>
  );
}
