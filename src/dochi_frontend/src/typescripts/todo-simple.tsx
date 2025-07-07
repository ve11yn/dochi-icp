import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Loader2, Trash2 } from 'lucide-react';
import { todoService, TodoItem, Note } from '../services/todoService';
import Sidebar from './sidebar';
import Header from './header';
import TopBar from './top-bar';

const TodoSimple: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'todo' | 'notes'>('todo');
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteDescription, setNewNoteDescription] = useState('');

  // Load data from backend
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [todosData, notesData] = await Promise.all([
        todoService.getAllTodos(),
        todoService.getAllNotes()
      ]);
      
      setTodos(todosData);
      setNotes(notesData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTodo = async () => {
    if (!newTodoTitle.trim()) return;
    
    try {
      const newTodo = await todoService.createTodo(newTodoTitle.trim());
      setTodos(prev => [newTodo, ...prev]);
      setNewTodoTitle('');
    } catch (err) {
      console.error('Error creating todo:', err);
      setError(err instanceof Error ? err.message : 'Failed to create todo');
    }
  };

  const handleCreateNote = async () => {
    if (!newNoteTitle.trim()) return;
    
    try {
      const newNote = await todoService.createNote(newNoteTitle.trim(), newNoteDescription.trim());
      setNotes(prev => [newNote, ...prev]);
      setNewNoteTitle('');
      setNewNoteDescription('');
    } catch (err) {
      console.error('Error creating note:', err);
      setError(err instanceof Error ? err.message : 'Failed to create note');
    }
  };

  const handleToggleTodo = async (id: string) => {
    try {
      const updatedTodo = await todoService.toggleTodo(id);
      setTodos(prev => prev.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
    } catch (err) {
      console.error('Error toggling todo:', err);
      setError(err instanceof Error ? err.message : 'Failed to update todo');
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await todoService.deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await todoService.deleteNote(id);
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (err) {
      console.error('Error deleting note:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete note');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={loadData}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="flex">
        <Sidebar activeSection="To-Do" handleNavClick={() => {}} />
        <div className="flex-1">
          <Header currentPage="To-Do" />
          <TopBar title="Tasks & Notes" />
          
          <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Tasks & Notes</h1>
              
              {/* Tab Navigation */}
              <div className="flex mb-6 border-b">
                <button
                  onClick={() => setActiveTab('todo')}
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'todo'
                      ? 'text-orange-600 border-b-2 border-orange-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Todos ({todos.length})
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`px-4 py-2 font-medium ml-6 ${
                    activeTab === 'notes'
                      ? 'text-orange-600 border-b-2 border-orange-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Notes ({notes.length})
                </button>
              </div>

              {/* Todo Tab */}
              {activeTab === 'todo' && (
                <div>
                  {/* Add New Todo */}
                  <div className="flex gap-2 mb-6">
                    <input
                      type="text"
                      value={newTodoTitle}
                      onChange={(e) => setNewTodoTitle(e.target.value)}
                      placeholder="Add a new task..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateTodo()}
                    />
                    <button
                      onClick={handleCreateTodo}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center gap-2"
                    >
                      <Plus size={20} />
                      Add
                    </button>
                  </div>

                  {/* Todo List */}
                  <div className="space-y-3">
                    {todos.map((todo) => (
                      <div
                        key={todo.id}
                        className={`flex items-center gap-3 p-4 rounded-lg border ${
                          todo.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
                        }`}
                      >
                        <button
                          onClick={() => handleToggleTodo(todo.id)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            todo.completed
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 hover:border-green-500'
                          }`}
                        >
                          {todo.completed && <Check size={12} />}
                        </button>
                        
                        <div className="flex-1">
                          <h3 className={`font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {todo.title}
                          </h3>
                          {todo.description && (
                            <p className={`text-sm ${todo.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                              {todo.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded ${
                              todo.priority === 'High' ? 'bg-red-100 text-red-800' :
                              todo.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {todo.priority}
                            </span>
                            <span className="text-xs text-gray-500">
                              {todo.createdAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    
                    {todos.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No tasks yet. Create your first task above!
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes Tab */}
              {activeTab === 'notes' && (
                <div>
                  {/* Add New Note */}
                  <div className="mb-6 space-y-3">
                    <input
                      type="text"
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      placeholder="Note title..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <textarea
                      value={newNoteDescription}
                      onChange={(e) => setNewNoteDescription(e.target.value)}
                      placeholder="Note content..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      onClick={handleCreateNote}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center gap-2"
                    >
                      <Plus size={20} />
                      Add Note
                    </button>
                  </div>

                  {/* Notes List */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {notes.map((note) => (
                      <div key={note.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 relative">
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
                        >
                          <X size={16} />
                        </button>
                        
                        <h3 className="font-medium text-gray-800 mb-2 pr-8">{note.title}</h3>
                        {note.description && (
                          <p className="text-sm text-gray-600 mb-2">{note.description}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {note.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    
                    {notes.length === 0 && (
                      <div className="col-span-2 text-center py-8 text-gray-500">
                        No notes yet. Create your first note above!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoSimple;