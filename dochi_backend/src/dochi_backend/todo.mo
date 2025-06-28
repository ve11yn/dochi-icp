import Array "mo:base/Array";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Char "mo:base/Char";
import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Nat32 "mo:base/Nat32";

actor TodoNotesBackend {
    
    // Define data types
    public type Priority = {
        #Low;
        #Medium; 
        #High;
    };

    public type Subtask = {
        id: Nat;
        text: Text;
        completed: Bool;
    };

    public type TodoItem = {
        id: Nat;
        title: Text;
        description: Text;
        priority: Priority;
        tags: [Text];
        subtasks: [Subtask];
        completed: Bool;
        createdAt: Int;
        updatedAt: Int;
    };

    public type Note = {
        id: Nat;
        title: Text;
        description: Text;
        tags: [Text];
        createdAt: Int;
        updatedAt: Int;
    };

    public type CreateTodoRequest = {
        title: Text;
        description: Text;
        priority: Priority;
        tags: [Text];
        subtasks: [Text]; // Just text, we'll create Subtask objects
    };

    public type CreateNoteRequest = {
        title: Text;
        description: Text;
        tags: [Text];
    };

    public type UpdateTodoRequest = {
        id: Nat;
        title: ?Text;
        description: ?Text;
        priority: ?Priority;
        tags: ?[Text];
        completed: ?Bool;
    };

    // Storage
    private stable var nextTodoId: Nat = 1;
    private stable var nextNoteId: Nat = 1;
    private stable var nextSubtaskId: Nat = 1;
    
    // Stable storage for upgrade persistence
    private stable var todosEntries: [(Nat, TodoItem)] = [];
    private stable var notesEntries: [(Nat, Note)] = [];
    
    // Runtime storage
    private var todos = HashMap.HashMap<Nat, TodoItem>(10, func(a: Nat, b: Nat): Bool { a == b }, func(a: Nat): Nat32 { Nat32.fromNat(a) });
    private var notes = HashMap.HashMap<Nat, Note>(10, func(a: Nat, b: Nat): Bool { a == b }, func(a: Nat): Nat32 { Nat32.fromNat(a) });

    // Initialize from stable storage
    todos := HashMap.fromIter<Nat, TodoItem>(todosEntries.vals(), todosEntries.size(), func(a: Nat, b: Nat): Bool { a == b }, func(a: Nat): Nat32 { Nat32.fromNat(a) });
    notes := HashMap.fromIter<Nat, Note>(notesEntries.vals(), notesEntries.size(), func(a: Nat, b: Nat): Bool { a == b }, func(a: Nat): Nat32 { Nat32.fromNat(a) });

    // System functions for upgrades
    system func preupgrade() {
        todosEntries := Iter.toArray(todos.entries());
        notesEntries := Iter.toArray(notes.entries());
    };

    system func postupgrade() {
        todosEntries := [];
        notesEntries := [];
    };

    // Helper functions
    private func createSubtasks(subtaskTexts: [Text]) : [Subtask] {
        Array.map<Text, Subtask>(subtaskTexts, func(text: Text): Subtask {
            let subtask: Subtask = {
                id = nextSubtaskId;
                text = text;
                completed = false;
            };
            nextSubtaskId += 1;
            subtask;
        });
    };

    private func updateSubtaskCompletion(subtasks: [Subtask], subtaskId: Nat, completed: Bool) : [Subtask] {
        Array.map<Subtask, Subtask>(subtasks, func(subtask: Subtask): Subtask {
            if (subtask.id == subtaskId) {
                {
                    id = subtask.id;
                    text = subtask.text;
                    completed = completed;
                }
            } else {
                subtask
            }
        });
    };

    private func areAllSubtasksCompleted(subtasks: [Subtask]) : Bool {
        if (subtasks.size() == 0) return false;
        Array.foldLeft<Subtask, Bool>(subtasks, true, func(acc: Bool, subtask: Subtask): Bool {
            acc and subtask.completed
        });
    };

    // Helper function for case-insensitive string comparison
    private func toLowercase(text: Text) : Text {
        Text.map(text, func(c: Char): Char {
            if (c >= 'A' and c <= 'Z') {
                Char.fromNat32(Char.toNat32(c) + 32)
            } else {
                c
            }
        });
    };

    // Todo CRUD operations
    public func createTodo(request: CreateTodoRequest) : async Result.Result<TodoItem, Text> {
        if (Text.size(request.title) == 0) {
            return #err("Title cannot be empty");
        };

        let now = Time.now();
        let todo: TodoItem = {
            id = nextTodoId;
            title = request.title;
            description = request.description;
            priority = request.priority;
            tags = request.tags;
            subtasks = createSubtasks(request.subtasks);
            completed = false;
            createdAt = now;
            updatedAt = now;
        };

        todos.put(nextTodoId, todo);
        nextTodoId += 1;
        #ok(todo);
    };

    public query func getTodo(id: Nat) : async ?TodoItem {
        todos.get(id);
    };

    public query func getAllTodos() : async [TodoItem] {
        Iter.toArray(todos.vals());
    };

    public func updateTodo(request: UpdateTodoRequest) : async Result.Result<TodoItem, Text> {
        switch (todos.get(request.id)) {
            case null { #err("Todo not found") };
            case (?existingTodo) {
                let updatedTodo: TodoItem = {
                    id = existingTodo.id;
                    title = Option.get(request.title, existingTodo.title);
                    description = Option.get(request.description, existingTodo.description);
                    priority = Option.get(request.priority, existingTodo.priority);
                    tags = Option.get(request.tags, existingTodo.tags);
                    subtasks = existingTodo.subtasks;
                    completed = Option.get(request.completed, existingTodo.completed);
                    createdAt = existingTodo.createdAt;
                    updatedAt = Time.now();
                };
                todos.put(request.id, updatedTodo);
                #ok(updatedTodo);
            };
        };
    };

    public func toggleSubtask(todoId: Nat, subtaskId: Nat) : async Result.Result<TodoItem, Text> {
        switch (todos.get(todoId)) {
            case null { #err("Todo not found") };
            case (?existingTodo) {
                let updatedSubtasks = Array.map<Subtask, Subtask>(existingTodo.subtasks, func(subtask: Subtask): Subtask {
                    if (subtask.id == subtaskId) {
                        {
                            id = subtask.id;
                            text = subtask.text;
                            completed = not subtask.completed;
                        }
                    } else {
                        subtask
                    }
                });

                let allCompleted = areAllSubtasksCompleted(updatedSubtasks);
                
                let updatedTodo: TodoItem = {
                    id = existingTodo.id;
                    title = existingTodo.title;
                    description = existingTodo.description;
                    priority = existingTodo.priority;
                    tags = existingTodo.tags;
                    subtasks = updatedSubtasks;
                    completed = allCompleted;
                    createdAt = existingTodo.createdAt;
                    updatedAt = Time.now();
                };
                
                todos.put(todoId, updatedTodo);
                #ok(updatedTodo);
            };
        };
    };

    public func addSubtask(todoId: Nat, subtaskText: Text) : async Result.Result<TodoItem, Text> {
        if (Text.size(subtaskText) == 0) {
            return #err("Subtask text cannot be empty");
        };

        switch (todos.get(todoId)) {
            case null { #err("Todo not found") };
            case (?existingTodo) {
                let newSubtask: Subtask = {
                    id = nextSubtaskId;
                    text = subtaskText;
                    completed = false;
                };
                nextSubtaskId += 1;

                let updatedSubtasks = Array.append<Subtask>(existingTodo.subtasks, [newSubtask]);
                
                let updatedTodo: TodoItem = {
                    id = existingTodo.id;
                    title = existingTodo.title;
                    description = existingTodo.description;
                    priority = existingTodo.priority;
                    tags = existingTodo.tags;
                    subtasks = updatedSubtasks;
                    completed = false; // Reset completion when adding new subtask
                    createdAt = existingTodo.createdAt;
                    updatedAt = Time.now();
                };
                
                todos.put(todoId, updatedTodo);
                #ok(updatedTodo);
            };
        };
    };

    public func deleteTodo(id: Nat) : async Result.Result<(), Text> {
        switch (todos.remove(id)) {
            case null { #err("Todo not found") };
            case (?_) { #ok(()) };
        };
    };

    // Note CRUD operations
    public func createNote(request: CreateNoteRequest) : async Result.Result<Note, Text> {
        if (Text.size(request.title) == 0) {
            return #err("Title cannot be empty");
        };

        let now = Time.now();
        let note: Note = {
            id = nextNoteId;
            title = request.title;
            description = request.description;
            tags = request.tags;
            createdAt = now;
            updatedAt = now;
        };

        notes.put(nextNoteId, note);
        nextNoteId += 1;
        #ok(note);
    };

    public query func getNote(id: Nat) : async ?Note {
        notes.get(id);
    };

    public query func getAllNotes() : async [Note] {
        Iter.toArray(notes.vals());
    };

    public func updateNote(id: Nat, title: ?Text, description: ?Text, tags: ?[Text]) : async Result.Result<Note, Text> {
        switch (notes.get(id)) {
            case null { #err("Note not found") };
            case (?existingNote) {
                let updatedNote: Note = {
                    id = existingNote.id;
                    title = Option.get(title, existingNote.title);
                    description = Option.get(description, existingNote.description);
                    tags = Option.get(tags, existingNote.tags);
                    createdAt = existingNote.createdAt;
                    updatedAt = Time.now();
                };
                notes.put(id, updatedNote);
                #ok(updatedNote);
            };
        };
    };

    public func deleteNote(id: Nat) : async Result.Result<(), Text> {
        switch (notes.remove(id)) {
            case null { #err("Note not found") };
            case (?_) { #ok(()) };
        };
    };

    // Utility functions
    public query func getTodosByTag(tag: Text) : async [TodoItem] {
        let allTodos = Iter.toArray(todos.vals());
        Array.filter<TodoItem>(allTodos, func(todo: TodoItem): Bool {
            Array.find<Text>(todo.tags, func(t: Text): Bool { t == tag }) != null
        });
    };

    public query func getNotesByTag(tag: Text) : async [Note] {
        let allNotes = Iter.toArray(notes.vals());
        Array.filter<Note>(allNotes, func(note: Note): Bool {
            Array.find<Text>(note.tags, func(t: Text): Bool { t == tag }) != null
        });
    };

    public query func getTodosByPriority(priority: Priority) : async [TodoItem] {
        let allTodos = Iter.toArray(todos.vals());
        Array.filter<TodoItem>(allTodos, func(todo: TodoItem): Bool {
            todo.priority == priority
        });
    };

    public query func getCompletedTodos() : async [TodoItem] {
        let allTodos = Iter.toArray(todos.vals());
        Array.filter<TodoItem>(allTodos, func(todo: TodoItem): Bool {
            todo.completed
        });
    };

    public query func getPendingTodos() : async [TodoItem] {
        let allTodos = Iter.toArray(todos.vals());
        Array.filter<TodoItem>(allTodos, func(todo: TodoItem): Bool {
            not todo.completed
        });
    };

    // Statistics
    // Statistics
    public query func getStats() : async {
        totalTodos: Nat;
        completedTodos: Nat;
        pendingTodos: Nat;
        totalNotes: Nat;
        totalSubtasks: Nat;
        completedSubtasks: Nat;
    } {
        let allTodos = Iter.toArray(todos.vals());
        let completedTodos = Array.filter<TodoItem>(allTodos, func(todo: TodoItem): Bool { todo.completed });
        
        var totalSubtasks = 0;
        var completedSubtasks = 0;
        
        // CORRECTED: Explicitly get an iterator from the array using Array.vals()
        for (todo in Array.vals(allTodos)) {
            totalSubtasks += todo.subtasks.size();
            // CORRECTED: Explicitly get an iterator from the subtasks array as well
            for (subtask in Array.vals(todo.subtasks)) {
                if (subtask.completed) {
                    completedSubtasks += 1;
                };
            };
        };

        {
            totalTodos = allTodos.size();
            completedTodos = completedTodos.size();
            pendingTodos = allTodos.size() - completedTodos.size();
            totalNotes = notes.size();
            totalSubtasks = totalSubtasks;
            completedSubtasks = completedSubtasks;
        };
    };

    // Search functionality
    public query func searchTodos(searchText: Text) : async [TodoItem] {
        let allTodos = Iter.toArray(todos.vals());
        let lowerQuery = Text.map(searchText, func(c: Char): Char {
            if (c >= 'A' and c <= 'Z') {
                Char.fromNat32(Char.toNat32(c) + 32)
            } else {
                c
            }
        });
        
        Array.filter<TodoItem>(allTodos, func(todo: TodoItem): Bool {
            let lowerTitle = toLowercase(todo.title);
            let lowerDesc = toLowercase(todo.description);
            
            Text.contains(lowerTitle, #text lowerQuery) or Text.contains(lowerDesc, #text lowerQuery)
        });
    };

    public query func searchNotes(searchText: Text) : async [Note] {
        let allNotes = Iter.toArray(notes.vals());
        // Corrected bug: Used the function argument 'searchText' instead of undefined 'query'
        let lowerQuery = toLowercase(searchText);
        
        // Corrected bug: Removed the trailing semicolon ';' to ensure the array is returned
        Array.filter<Note>(allNotes, func(note: Note): Bool {
            let lowerTitle = toLowercase(note.title);
            let lowerDesc = toLowercase(note.description);
            
            Text.contains(lowerTitle, #text lowerQuery) or Text.contains(lowerDesc, #text lowerQuery)
        })
    };
}