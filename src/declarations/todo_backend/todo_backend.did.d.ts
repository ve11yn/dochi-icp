import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface CreateNoteRequest {
  'title' : string,
  'tags' : Array<string>,
  'description' : string,
}
export interface CreateTodoRequest {
  'title' : string,
  'tags' : Array<string>,
  'description' : string,
  'priority' : Priority,
  'subtasks' : Array<string>,
}
export interface Note {
  'id' : bigint,
  'title' : string,
  'createdAt' : bigint,
  'tags' : Array<string>,
  'description' : string,
  'updatedAt' : bigint,
}
export type Priority = { 'Low' : null } |
  { 'High' : null } |
  { 'Medium' : null };
export type Result = { 'ok' : TodoItem } |
  { 'err' : string };
export type Result_1 = { 'ok' : Note } |
  { 'err' : string };
export type Result_2 = { 'ok' : null } |
  { 'err' : string };
export interface Subtask {
  'id' : bigint,
  'text' : string,
  'completed' : boolean,
}
export interface TodoItem {
  'id' : bigint,
  'title' : string,
  'createdAt' : bigint,
  'tags' : Array<string>,
  'completed' : boolean,
  'description' : string,
  'updatedAt' : bigint,
  'priority' : Priority,
  'subtasks' : Array<Subtask>,
}
export interface UpdateTodoRequest {
  'id' : bigint,
  'title' : [] | [string],
  'tags' : [] | [Array<string>],
  'completed' : [] | [boolean],
  'description' : [] | [string],
  'priority' : [] | [Priority],
}
export interface _SERVICE {
  'addSubtask' : ActorMethod<[bigint, string], Result>,
  'createNote' : ActorMethod<[CreateNoteRequest], Result_1>,
  'createTodo' : ActorMethod<[CreateTodoRequest], Result>,
  'deleteNote' : ActorMethod<[bigint], Result_2>,
  'deleteTodo' : ActorMethod<[bigint], Result_2>,
  'getAllNotes' : ActorMethod<[], Array<Note>>,
  'getAllTodos' : ActorMethod<[], Array<TodoItem>>,
  'getCompletedTodos' : ActorMethod<[], Array<TodoItem>>,
  'getNote' : ActorMethod<[bigint], [] | [Note]>,
  'getNotesByTag' : ActorMethod<[string], Array<Note>>,
  'getPendingTodos' : ActorMethod<[], Array<TodoItem>>,
  'getStats' : ActorMethod<
    [],
    {
      'totalTodos' : bigint,
      'totalSubtasks' : bigint,
      'completedTodos' : bigint,
      'completedSubtasks' : bigint,
      'totalNotes' : bigint,
      'pendingTodos' : bigint,
    }
  >,
  'getTodo' : ActorMethod<[bigint], [] | [TodoItem]>,
  'getTodosByPriority' : ActorMethod<[Priority], Array<TodoItem>>,
  'getTodosByTag' : ActorMethod<[string], Array<TodoItem>>,
  'searchNotes' : ActorMethod<[string], Array<Note>>,
  'searchTodos' : ActorMethod<[string], Array<TodoItem>>,
  'toggleSubtask' : ActorMethod<[bigint, bigint], Result>,
  'updateNote' : ActorMethod<
    [bigint, [] | [string], [] | [string], [] | [Array<string>]],
    Result_1
  >,
  'updateTodo' : ActorMethod<[UpdateTodoRequest], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
