export const idlFactory = ({ IDL }) => {
  const Priority = IDL.Variant({
    'Low' : IDL.Null,
    'High' : IDL.Null,
    'Medium' : IDL.Null,
  });
  const Subtask = IDL.Record({
    'id' : IDL.Nat,
    'text' : IDL.Text,
    'completed' : IDL.Bool,
  });
  const TodoItem = IDL.Record({
    'id' : IDL.Nat,
    'title' : IDL.Text,
    'createdAt' : IDL.Int,
    'tags' : IDL.Vec(IDL.Text),
    'completed' : IDL.Bool,
    'description' : IDL.Text,
    'updatedAt' : IDL.Int,
    'priority' : Priority,
    'subtasks' : IDL.Vec(Subtask),
  });
  const Result = IDL.Variant({ 'ok' : TodoItem, 'err' : IDL.Text });
  const CreateNoteRequest = IDL.Record({
    'title' : IDL.Text,
    'tags' : IDL.Vec(IDL.Text),
    'description' : IDL.Text,
  });
  const Note = IDL.Record({
    'id' : IDL.Nat,
    'title' : IDL.Text,
    'createdAt' : IDL.Int,
    'tags' : IDL.Vec(IDL.Text),
    'description' : IDL.Text,
    'updatedAt' : IDL.Int,
  });
  const Result_1 = IDL.Variant({ 'ok' : Note, 'err' : IDL.Text });
  const CreateTodoRequest = IDL.Record({
    'title' : IDL.Text,
    'tags' : IDL.Vec(IDL.Text),
    'description' : IDL.Text,
    'priority' : Priority,
    'subtasks' : IDL.Vec(IDL.Text),
  });
  const Result_2 = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const UpdateTodoRequest = IDL.Record({
    'id' : IDL.Nat,
    'title' : IDL.Opt(IDL.Text),
    'tags' : IDL.Opt(IDL.Vec(IDL.Text)),
    'completed' : IDL.Opt(IDL.Bool),
    'description' : IDL.Opt(IDL.Text),
    'priority' : IDL.Opt(Priority),
  });
  return IDL.Service({
    'addSubtask' : IDL.Func([IDL.Nat, IDL.Text], [Result], []),
    'createNote' : IDL.Func([CreateNoteRequest], [Result_1], []),
    'createTodo' : IDL.Func([CreateTodoRequest], [Result], []),
    'deleteNote' : IDL.Func([IDL.Nat], [Result_2], []),
    'deleteTodo' : IDL.Func([IDL.Nat], [Result_2], []),
    'getAllNotes' : IDL.Func([], [IDL.Vec(Note)], ['query']),
    'getAllTodos' : IDL.Func([], [IDL.Vec(TodoItem)], ['query']),
    'getCompletedTodos' : IDL.Func([], [IDL.Vec(TodoItem)], ['query']),
    'getNote' : IDL.Func([IDL.Nat], [IDL.Opt(Note)], ['query']),
    'getNotesByTag' : IDL.Func([IDL.Text], [IDL.Vec(Note)], ['query']),
    'getPendingTodos' : IDL.Func([], [IDL.Vec(TodoItem)], ['query']),
    'getStats' : IDL.Func(
        [],
        [
          IDL.Record({
            'totalTodos' : IDL.Nat,
            'totalSubtasks' : IDL.Nat,
            'completedTodos' : IDL.Nat,
            'completedSubtasks' : IDL.Nat,
            'totalNotes' : IDL.Nat,
            'pendingTodos' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
    'getTodo' : IDL.Func([IDL.Nat], [IDL.Opt(TodoItem)], ['query']),
    'getTodosByPriority' : IDL.Func([Priority], [IDL.Vec(TodoItem)], ['query']),
    'getTodosByTag' : IDL.Func([IDL.Text], [IDL.Vec(TodoItem)], ['query']),
    'searchNotes' : IDL.Func([IDL.Text], [IDL.Vec(Note)], ['query']),
    'searchTodos' : IDL.Func([IDL.Text], [IDL.Vec(TodoItem)], ['query']),
    'toggleSubtask' : IDL.Func([IDL.Nat, IDL.Nat], [Result], []),
    'updateNote' : IDL.Func(
        [
          IDL.Nat,
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Vec(IDL.Text)),
        ],
        [Result_1],
        [],
      ),
    'updateTodo' : IDL.Func([UpdateTodoRequest], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
