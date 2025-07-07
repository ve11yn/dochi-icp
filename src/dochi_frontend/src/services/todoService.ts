// todoService.ts - Service to connect frontend with todo_backend
import { Actor, ActorSubclass, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { idlFactory, canisterId as declaredCanisterId } from '../../../declarations/todo_backend';
import type { 
  _SERVICE, 
  TodoItem as BackendTodoItem, 
  Note as BackendNote,
  CreateTodoRequest,
  CreateNoteRequest,
  UpdateTodoRequest,
  Priority,
  Subtask as BackendSubtask
} from '../../../declarations/todo_backend/todo_backend.did';

// Frontend types (converted from backend BigInt to easier types for display)
export interface TodoItem {
  id: string; // Convert BigInt to string for easier handling
  title: string;
  description: string;
  completed: boolean;
  priority: 'Low' | 'Medium' | 'High';
  tags: string[];
  subtasks: Subtask[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Note {
  id: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoStats {
  totalTodos: number;
  completedTodos: number;
  pendingTodos: number;
  totalSubtasks: number;
  completedSubtasks: number;
  totalNotes: number;
}

// Helper functions to convert between backend and frontend types
const convertPriorityFromBackend = (priority: Priority): 'Low' | 'Medium' | 'High' => {
  if ('Low' in priority) return 'Low';
  if ('Medium' in priority) return 'Medium';
  if ('High' in priority) return 'High';
  return 'Medium'; // fallback
};

const convertPriorityToBackend = (priority: 'Low' | 'Medium' | 'High'): Priority => {
  switch (priority) {
    case 'Low': return { 'Low': null };
    case 'Medium': return { 'Medium': null };
    case 'High': return { 'High': null };
    default: return { 'Medium': null };
  }
};

const convertSubtaskFromBackend = (subtask: BackendSubtask): Subtask => ({
  id: subtask.id.toString(),
  text: subtask.text,
  completed: subtask.completed
});

const convertTodoFromBackend = (todo: BackendTodoItem): TodoItem => ({
  id: todo.id.toString(),
  title: todo.title,
  description: todo.description,
  completed: todo.completed,
  priority: convertPriorityFromBackend(todo.priority),
  tags: todo.tags,
  subtasks: todo.subtasks.map(convertSubtaskFromBackend),
  createdAt: new Date(Number(todo.createdAt / BigInt(1000000))), // Convert nanoseconds to milliseconds
  updatedAt: new Date(Number(todo.updatedAt / BigInt(1000000)))
});

const convertNoteFromBackend = (note: BackendNote): Note => ({
  id: note.id.toString(),
  title: note.title,
  description: note.description,
  tags: note.tags,
  createdAt: new Date(Number(note.createdAt / BigInt(1000000))),
  updatedAt: new Date(Number(note.updatedAt / BigInt(1000000)))
});

const getActor = async (): Promise<ActorSubclass<_SERVICE>> => {
  const authClient = await AuthClient.create();

  if (!(await authClient.isAuthenticated())) {
    throw new Error("User not authenticated");
  }

  const identity = authClient.getIdentity();
  
  // Get canister ID with fallback
  const canisterId = declaredCanisterId || process.env.CANISTER_ID_TODO_BACKEND;
  
  if (!canisterId) {
    throw new Error("Todo backend canister ID not found. Make sure the canister is deployed.");
  }

  const host = process.env.NODE_ENV === 'production' 
    ? 'https://ic0.app' 
    : 'http://127.0.0.1:4943';

  const agent = new HttpAgent({
    identity,
    host,
  });

  if (process.env.NODE_ENV !== 'production') {
    await agent.fetchRootKey().catch(err => {
      console.warn("Unable to fetch root key. Check that your local replica is running.");
      console.error(err);
    });
  }

  return Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId,
  });
};

class TodoService {
  // Todo methods
  async getAllTodos(): Promise<TodoItem[]> {
    try {
      const actor = await getActor();
      const todos = await actor.getAllTodos();
      return todos.map(convertTodoFromBackend);
    } catch (error) {
      console.error('Error getting todos:', error);
      throw error;
    }
  }

  async getPendingTodos(): Promise<TodoItem[]> {
    try {
      const actor = await getActor();
      const todos = await actor.getPendingTodos();
      return todos.map(convertTodoFromBackend);
    } catch (error) {
      console.error('Error getting pending todos:', error);
      throw error;
    }
  }

  async getCompletedTodos(): Promise<TodoItem[]> {
    try {
      const actor = await getActor();
      const todos = await actor.getCompletedTodos();
      return todos.map(convertTodoFromBackend);
    } catch (error) {
      console.error('Error getting completed todos:', error);
      throw error;
    }
  }

  async createTodo(title: string, description: string = '', priority: 'Low' | 'Medium' | 'High' = 'Medium', tags: string[] = [], subtasks: string[] = []): Promise<TodoItem> {
    try {
      const actor = await getActor();
      const request: CreateTodoRequest = {
        title,
        description,
        priority: convertPriorityToBackend(priority),
        tags,
        subtasks
      };
      
      const result = await actor.createTodo(request);
      
      if ('ok' in result) {
        return convertTodoFromBackend(result.ok);
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  }

  async updateTodo(id: string, updates: Partial<Pick<TodoItem, 'title' | 'description' | 'completed' | 'priority' | 'tags'>>): Promise<TodoItem> {
    try {
      const actor = await getActor();
      const request: UpdateTodoRequest = {
        id: BigInt(id),
        title: updates.title ? [updates.title] : [],
        description: updates.description ? [updates.description] : [],
        completed: updates.completed !== undefined ? [updates.completed] : [],
        priority: updates.priority ? [convertPriorityToBackend(updates.priority)] : [],
        tags: updates.tags ? [updates.tags] : []
      };
      
      const result = await actor.updateTodo(request);
      
      if ('ok' in result) {
        return convertTodoFromBackend(result.ok);
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  }

  async deleteTodo(id: string): Promise<void> {
    try {
      const actor = await getActor();
      const result = await actor.deleteTodo(BigInt(id));
      
      if ('err' in result) {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  }

  async toggleTodo(id: string): Promise<TodoItem> {
    try {
      const actor = await getActor();
      const todo = await actor.getTodo(BigInt(id));
      
      if (todo.length === 0) {
        throw new Error('Todo not found');
      }
      
      const currentTodo = todo[0];
      return await this.updateTodo(id, { completed: !currentTodo.completed });
    } catch (error) {
      console.error('Error toggling todo:', error);
      throw error;
    }
  }

  // Note methods
  async getAllNotes(): Promise<Note[]> {
    try {
      const actor = await getActor();
      const notes = await actor.getAllNotes();
      return notes.map(convertNoteFromBackend);
    } catch (error) {
      console.error('Error getting notes:', error);
      throw error;
    }
  }

  async createNote(title: string, description: string = '', tags: string[] = []): Promise<Note> {
    try {
      const actor = await getActor();
      const request: CreateNoteRequest = {
        title,
        description,
        tags
      };
      
      const result = await actor.createNote(request);
      
      if ('ok' in result) {
        return convertNoteFromBackend(result.ok);
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }

  async deleteNote(id: string): Promise<void> {
    try {
      const actor = await getActor();
      const result = await actor.deleteNote(BigInt(id));
      
      if ('err' in result) {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }

  // Stats
  async getStats(): Promise<TodoStats> {
    try {
      const actor = await getActor();
      const stats = await actor.getStats();
      return {
        totalTodos: Number(stats.totalTodos),
        completedTodos: Number(stats.completedTodos),
        pendingTodos: Number(stats.pendingTodos),
        totalSubtasks: Number(stats.totalSubtasks),
        completedSubtasks: Number(stats.completedSubtasks),
        totalNotes: Number(stats.totalNotes)
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  }
}

export const todoService = new TodoService();