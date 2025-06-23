import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Calendar, Flag, Tag, Check, X, ChevronDown, Palette } from 'lucide-react';
import Sidebar from './sidebar';
import Header from './header';
import TopBar from './top-bar';

// TypeScript interfaces
interface Subtask {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoItem {
  id: number;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  tags: string[];
  subtasks: Subtask[];
  completed: boolean;
  date: string;
  color: string;
  isEditing?: boolean;
}

interface Note {
  id: number;
  title: string;
  description: string;
  tags: string[];
  date: string;
  color: string;
  isEditing?: boolean;
}

const ToDo: React.FC = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<string>('To-Do');
  const [activeTab, setActiveTab] = useState<'todo' | 'notes'>('todo');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingTodo, setEditingTodo] = useState<number | null>(null);
  const [editingNote, setEditingNote] = useState<number | null>(null);

  const handleNavClick = (page: string): void => {
    setActiveSection(page);
  };

  // Predefined tags and colors
  const predefinedTags: string[] = [
    'Personal', 'Learning', 'Hobby', 'Work', 'Health', 'Shopping',
    'Travel', 'Finance', 'Family', 'Project'
  ];

  const noteColors: string[] = ['#D8F1F8', '#F9EBF7', '#E0EAFA', '#FBF1ED'];
  const todoColors: string[] = ['#FFFFFF', '#D8F1F8', '#F9EBF7', '#E0EAFA', '#FBF1ED'];

  const priorities: Array<'Low' | 'Medium' | 'High'> = ['Low', 'Medium', 'High'];
  const priorityColors: Record<'Low' | 'Medium' | 'High', string> = {
    Low: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    High: 'bg-red-100 text-red-800'
  };

  // Create new todo
  const createNewTodo = (): void => {
    const newTodo: TodoItem = {
      id: Date.now(),
      title: '',
      description: '',
      priority: 'Medium',
      tags: [],
      subtasks: [],
      completed: false,
      date: new Date().toISOString().split('T')[0],
      color: todoColors[0],
      isEditing: true
    };
    setTodos(prev => [newTodo, ...prev]);
    setEditingTodo(newTodo.id);
  };

  const createNewNote = (): void => {
    const newNote: Note = {
      id: Date.now(),
      title: '',
      description: '',
      tags: [],
      date: new Date().toISOString().split('T')[0],
      color: noteColors[0],
      isEditing: true
    };
    setNotes(prev => [newNote, ...prev]);
    setEditingNote(newNote.id);
  };

  const sortItems = <T extends TodoItem | Note>(items: T[], type: 'todo' | 'notes'): T[] => {
    return [...items].sort((a, b) => {
      if (type === 'todo') {
        const todoA = a as TodoItem;
        const todoB = b as TodoItem;
        // Completed items go to the end
        if (todoA.completed !== todoB.completed) {
          return todoA.completed ? 1 : -1;
        }
      }
      
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'priority':
          if (type === 'todo') {
            const priorityOrder: Record<'High' | 'Medium' | 'Low', number> = { High: 3, Medium: 2, Low: 1 };
            const todoA = a as TodoItem;
            const todoB = b as TodoItem;
            return priorityOrder[todoB.priority] - priorityOrder[todoA.priority];
          }
          return 0;
        default:
          return 0;
      }
    });
  };

  const toggleTodoComplete = (todoId: number): void => {
    setTodos(prev => prev.map(todo => {
      if (todo.id === todoId) {
        const allSubtasksCompleted = todo.subtasks.length > 0 ? todo.subtasks.every(subtask => subtask.completed) : false;
        return { ...todo, completed: allSubtasksCompleted || !todo.completed };
      }
      return todo;
    }));
  };

  const toggleSubtask = (todoId: number, subtaskId: number): void => {
    setTodos(prev => prev.map(todo => {
      if (todo.id === todoId) {
        const updatedSubtasks = todo.subtasks.map(subtask =>
          subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
        );
        const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every(subtask => subtask.completed);
        return { ...todo, subtasks: updatedSubtasks, completed: allCompleted };
      }
      return todo;
    }));
  };

  const updateTodo = (todoId: number, field: keyof TodoItem, value: any): void => {
    setTodos(prev => prev.map(todo => 
      todo.id === todoId ? { ...todo, [field]: value } : todo
    ));
  };

  const updateNote = (noteId: number, field: keyof Note, value: any): void => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, [field]: value } : note
    ));
  };

  const addSubtask = (todoId: number, text: string): void => {
    if (!text.trim()) return;
    const newSubtask: Subtask = {
      id: Date.now(),
      text: text.trim(),
      completed: false
    };
    setTodos(prev => prev.map(todo => 
      todo.id === todoId 
        ? { ...todo, subtasks: [...todo.subtasks, newSubtask] }
        : todo
    ));
  };

  const removeSubtask = (todoId: number, subtaskId: number): void => {
    setTodos(prev => prev.map(todo => 
      todo.id === todoId 
        ? { ...todo, subtasks: todo.subtasks.filter(s => s.id !== subtaskId) }
        : todo
    ));
  };

  const toggleTag = (itemId: number, tag: string, type: 'todo' | 'note'): void => {
    if (type === 'todo') {
      setTodos(prev => prev.map(todo => 
        todo.id === itemId 
          ? { 
              ...todo, 
              tags: todo.tags.includes(tag) 
                ? todo.tags.filter(t => t !== tag)
                : [...todo.tags, tag]
            }
          : todo
      ));
    } else {
      setNotes(prev => prev.map(note => 
        note.id === itemId 
          ? { 
              ...note, 
              tags: note.tags.includes(tag) 
                ? note.tags.filter(t => t !== tag)
                : [...note.tags, tag]
            }
          : note
      ));
    }
  };

  const startEditingTodo = (todoId: number): void => {
    setEditingTodo(todoId);
    setEditingNote(null);
  };

  const startEditingNote = (noteId: number): void => {
    setEditingNote(noteId);
    setEditingTodo(null);
  };

  const stopEditing = (): void => {
    setEditingTodo(null);
    setEditingNote(null);
  };

  const deleteTodo = (todoId: number): void => {
    setTodos(prev => prev.filter(todo => todo.id !== todoId));
    if (editingTodo === todoId) setEditingTodo(null);
  };

  const deleteNote = (noteId: number): void => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    if (editingNote === noteId) setEditingNote(null);
  };

  const EditableTodoCard: React.FC<{ todo: TodoItem }> = ({ todo }) => {
    const [newSubtaskText, setNewSubtaskText] = useState<string>('');
    const [showTagDropdown, setShowTagDropdown] = useState<boolean>(false);
    const [showColorPalette, setShowColorPalette] = useState<boolean>(false);
    const isEditing = editingTodo === todo.id;

    return (
      <div 
        className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
          todo.completed 
            ? 'border-green-200 opacity-75' 
            : isEditing
            ? 'border-black/20 hover:border-black/30'
            : 'border-black/10 hover:border-black/20'
        }`}
        style={{ backgroundColor: todo.color }}
        onClick={() => !isEditing && startEditingTodo(todo.id)}
      >
        <div className="flex items-start gap-3">
          <div 
            className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
              todo.completed 
                ? 'bg-green-500 border-green-500' 
                : 'border-gray-300 hover:border-green-500'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              toggleTodoComplete(todo.id);
            }}
          >
            {todo.completed && <Check size={14} className="text-white" />}
          </div>
          
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={todo.title}
                  onChange={(e) => updateTodo(todo.id, 'title', e.target.value)}
                  placeholder="Todo title..."
                  autoFocus
                  className="w-full font-semibold bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                />

                <textarea
                  value={todo.description}
                  onChange={(e) => updateTodo(todo.id, 'description', e.target.value)}
                  placeholder="Description..."
                  className="w-full text-gray-600 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none resize-none"
                  rows={2}
                />

                <div className="flex items-center gap-4">
                  <select
                    value={todo.priority}
                    onChange={(e) => updateTodo(todo.id, 'priority', e.target.value)}
                    className="px-2 py-1 rounded-full text-xs font-medium border"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {priorities.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>

                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowColorPalette(!showColorPalette);
                      }}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      <Palette size={14} />
                      Color
                    </button>
                    
                    {showColorPalette && (
                      <div className="absolute z-10 mt-1 p-2 bg-white border rounded-lg shadow-lg">
                        <div className="flex gap-2">
                          {todoColors.map(color => (
                            <button
                              key={color}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateTodo(todo.id, 'color', color);
                                setShowColorPalette(false);
                              }}
                              className={`w-6 h-6 rounded-full border-2 ${
                                todo.color === color ? 'border-gray-600' : 'border-gray-300'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubtaskText}
                      onChange={(e) => setNewSubtaskText(e.target.value)}
                      placeholder="Add subtask..."
                      className="flex-1 text-sm border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addSubtask(todo.id, newSubtaskText);
                          setNewSubtaskText('');
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addSubtask(todo.id, newSubtaskText);
                        setNewSubtaskText('');
                      }}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  {todo.subtasks.map(subtask => (
                    <div key={subtask.id} className="flex items-center gap-2 text-sm">
                      <div 
                        className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer ${
                          subtask.completed 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                        onClick={() => toggleSubtask(todo.id, subtask.id)}
                      >
                        {subtask.completed && <Check size={10} className="text-white" />}
                      </div>
                      <span className={`flex-1 ${subtask.completed ? 'line-through text-gray-500' : ''}`}>
                        {subtask.text}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSubtask(todo.id, subtask.id);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTagDropdown(!showTagDropdown);
                    }}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    <Tag size={14} />
                    Add Tags
                  </button>
                  
                  {showTagDropdown && (
                    <div className="absolute z-10 mt-1 bg-white border rounded-lg shadow-lg max-h-32 overflow-y-auto">
                      {predefinedTags.map(tag => (
                        <button
                          key={tag}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTag(todo.id, tag, 'todo');
                          }}
                          className={`block w-full px-3 py-1 text-left text-sm hover:bg-gray-50 ${
                            todo.tags.includes(tag) ? 'bg-blue-50 text-blue-700' : ''
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {todo.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {tag}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTag(todo.id, tag, 'todo');
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X size={8} />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="text-xs text-gray-500">
                    {new Date(todo.date).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTodo(todo.id);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        stopEditing();
                      }}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className={`font-semibold ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                    {todo.title || 'Untitled Todo'}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[todo.priority]}`}>
                    {todo.priority}
                  </span>
                </div>
                
                {todo.description && (
                  <p className={`text-gray-600 mb-3 ${todo.completed ? 'line-through' : ''}`}>
                    {todo.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {todo.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                
                {todo.subtasks.length > 0 && (
                  <div className="space-y-2 mb-3">
                    <p className="text-sm font-medium text-gray-700">Subtasks:</p>
                    {todo.subtasks.map(subtask => (
                      <div key={subtask.id} className="flex items-center gap-2 text-sm">
                        <div 
                          className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer ${
                            subtask.completed 
                              ? 'bg-green-500 border-green-500' 
                              : 'border-gray-300 hover:border-green-500'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSubtask(todo.id, subtask.id);
                          }}
                        >
                          {subtask.completed && <Check size={10} className="text-white" />}
                        </div>
                        <span className={subtask.completed ? 'line-through text-gray-500' : ''}>
                          {subtask.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="text-xs text-gray-500">
                  {new Date(todo.date).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const EditableNoteCard: React.FC<{ note: Note }> = ({ note }) => {
    const [showTagDropdown, setShowTagDropdown] = useState<boolean>(false);
    const [showColorPalette, setShowColorPalette] = useState<boolean>(false);
    const isEditing = editingNote === note.id;

    return (
      <div 
        className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
          isEditing
            ? 'border-blue-300 ring-2 ring-blue-200'
            : 'border-black/10 hover:border-black/20'
        }`}
        style={{ backgroundColor: note.color }}
        onClick={() => !isEditing && startEditingNote(note.id)}
      >
        {isEditing ? (
          <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={note.title}
              onChange={(e) => updateNote(note.id, 'title', e.target.value)}
              placeholder="Note title..."
              className="w-full font-semibold bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none"
              autoFocus={isEditing && !note.description}
            />

            <textarea
              value={note.description}
              onChange={(e) => updateNote(note.id, 'description', e.target.value)}
              placeholder="Write your note here..."
              className="w-full text-gray-600 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none resize-none"
              rows={4}
            />

            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowColorPalette(!showColorPalette)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  <Palette size={14} />
                  Color
                </button>
                
                {showColorPalette && (
                  <div className="absolute z-10 mt-1 p-2 bg-white border rounded-lg shadow-lg">
                    <div className="flex gap-2">
                      {noteColors.map(color => (
                        <button
                          key={color}
                          onClick={() => {
                            updateNote(note.id, 'color', color);
                            setShowColorPalette(false);
                          }}
                          className={`w-6 h-6 rounded-full border-2 ${
                            note.color === color ? 'border-gray-600' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowTagDropdown(!showTagDropdown)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  <Tag size={14} />
                  Tags
                </button>
                
                {showTagDropdown && (
                  <div className="absolute z-10 mt-1 bg-white border rounded-lg shadow-lg max-h-32 overflow-y-auto">
                    {predefinedTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(note.id, tag, 'note')}
                        className={`block w-full px-3 py-1 text-left text-sm hover:bg-gray-50 ${
                          note.tags.includes(tag) ? 'bg-blue-50 text-blue-700' : ''
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {note.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {tag}
                  <button
                    onClick={() => toggleTag(note.id, tag, 'note')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X size={8} />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="text-xs text-gray-500">
                {new Date(note.date).toLocaleDateString()}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
                <button
                  onClick={stopEditing}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="font-semibold mb-2">{note.title || 'Untitled Note'}</h3>
            {note.description && (
              <p className="text-gray-600 mb-3 whitespace-pre-line">{note.description}</p>
            )}
            
            <div className="flex flex-wrap gap-1 mb-3">
              {note.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="text-xs text-gray-500">
              {new Date(note.date).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>
    );
  };

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    // Check if the click is inside an editable input or textarea
    const isEditableField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';
    if (!isEditableField && !target.closest('.editable-card')) {
      stopEditing();
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

  return (
    <div className="flex h-screen">
      <div className="flex-1 min-h-full bg-gradient-to-br from-blue-50/80 to-pink-20/80">
        <Header currentPage='To-Do'/>
        <div className="px-8 pb-8">
          <div className="flex items-center border border-black/10 justify-between mb-6 bg-white px-3 py-2 mt-6 rounded-lg">
            <div className="flex items-center gap-4 ">
              <div className="flex items-center space-x-1 bg-[#FFD4F2] border-black/10 text-purple-700 rounded-full p-1">
                <button
                  onClick={() => setActiveTab('todo')}
                  className={`rounded-full px-4 py-1 text-sm font-semibold transition-none ${
                    activeTab === 'todo' 
                      ? 'bg-white  text-purple-700 shadow-sm' 
                      : 'bg-[#FFD4F2] text-gray-800 '
                  }`}
                >
                  To-Do List
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`rounded-full px-4 py-1 text-sm font-semibold transition-none ${
                    activeTab === 'notes' 
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'bg-[#FFD4F2] text-gray-800 '
                  }`}
                >
                  Notes
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Sort By */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'priority')}
                  className="appearaance-none px-3 py-2 bg-transparent shadow-none border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Date</option>
                  {activeTab === 'todo' && <option value="priority">Priority</option>}
                </select>
              </div>

              <button
                onClick={() => activeTab === 'todo' ? createNewTodo() : createNewNote()}
                className="flex items-center gap-2 px-4 py-1 bg-[#FFD4F2] text-gray-800 rounded-full hover:bg-gray-100 font-medium transition-colors shadow-sm"
              >
                <Plus size={16} />
                Create
              </button>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTab === 'todo' ? (
              sortItems(todos, 'todo').map(todo => (
                <div key={todo.id} className="editable-card">
                  <EditableTodoCard todo={todo} />
                </div>
              ))
            ) : (
              sortItems(notes, 'notes').map(note => (
                <div key={note.id} className="editable-card">
                  <EditableNoteCard note={note} />
                </div>
              ))
            )}
          </div>

          {/* Empty State */}
          {((activeTab === 'todo' && todos.length === 0) || (activeTab === 'notes' && notes.length === 0)) && (
            <div className="text-center py-12 flex flex-col items-center justify-center min-h-[400px]">
              <div className="text-gray-400 mb-4">
                {activeTab === 'todo' ? (
                  <Flag size={48} className="mx-auto" />
                ) : (
                  <Tag size={48} className="mx-auto" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No {activeTab === 'todo' ? "to-do's" : 'notes'} yet
              </h3>
              <p className="text-gray-500 mb-4">
                Create your first {activeTab === 'todo' ? 'to-do' : 'note'} 
              </p>
         
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToDo;