import Array "mo:base/Array";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Char "mo:base/Char";
import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Nat32 "mo:base/Nat32";
import Principal "mo:base/Principal";

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
        userId: Principal; // ADDED: User association
    };

    public type Note = {
        id: Nat;
        title: Text;
        description: Text;
        tags: [Text];
        createdAt: Int;
        updatedAt: Int;
        userId: Principal; // ADDED: User association
    };

    public type CreateTodoRequest = {
        title: Text;
        description: Text;
        priority: Priority;
        tags: [Text];
        subtasks: [Text];
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

    // System functions for upgrades
    system func preupgrade() {
        todosEntries := Iter.toArray(todos.entries());
        notesEntries := Iter.toArray(notes.entries());
    };

    system func postupgrade() {
        todos := HashMap.fromIter<Nat, TodoItem>(todosEntries.vals(), todosEntries.size(), func(a: Nat, b: Nat): Bool { a == b }, func(a: Nat): Nat32 { Nat32.fromNat(a) });
        notes := HashMap.fromIter<Nat, Note>(notesEntries.vals(), notesEntries.size(), func(a: Nat, b: Nat): Bool { a == b }, func(a: Nat): Nat32 { Nat32.fromNat(a) });
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

    // ADDED: Helper to filter user-specific items
    private func getUserTodos(userId: Principal) : [TodoItem] {
        let allTodos = Iter.toArray(todos.vals());
        Array.filter<TodoItem>(allTodos, func(todo: TodoItem): Bool {
            todo.userId == userId
        });
    };

    private func getUserNotes(userId: Principal) : [Note] {
        let allNotes = Iter.toArray(notes.vals());
        Array.filter<Note>(allNotes, func(note: Note): Bool {
            note.userId == userId
        });
    };

    // Todo CRUD operations - UPDATED with user authentication
    public shared(msg) func createTodo(request: CreateTodoRequest) : async Result.Result<TodoItem, Text> {
        let caller = msg.caller;
        
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
            userId = caller; // ADDED: Associate with user
        };

        todos.put(nextTodoId, todo);
        nextTodoId += 1;
        #ok(todo);
    };

    public shared(msg) func getTodo(id: Nat) : async ?TodoItem {
        let caller = msg.caller;
        switch (todos.get(id)) {
            case (?todo) {
                if (todo.userId == caller) { ?todo } else { null }
            };
            case null { null };
        };
    };

    public shared(msg) func getAllTodos() : async [TodoItem] {
        let caller = msg.caller;
        getUserTodos(caller);
    };

    public shared(msg) func updateTodo(request: UpdateTodoRequest) : async Result.Result<TodoItem, Text> {
        let caller = msg.caller;
        
        switch (todos.get(request.id)) {
            case null { #err("Todo not found") };
            case (?existingTodo) {
                // ADDED: Check user ownership
                if (existingTodo.userId != caller) {
                    return #err("Unauthorized");
                };
                
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
                    userId = existingTodo.userId;
                };
                todos.put(request.id, updatedTodo);
                #ok(updatedTodo);
            };
        };
    };

    public shared(msg) func toggleSubtask(todoId: Nat, subtaskId: Nat) : async Result.Result<TodoItem, Text> {
        let caller = msg.caller;
        
        switch (todos.get(todoId)) {
            case null { #err("Todo not found") };
            case (?existingTodo) {
                // ADDED: Check user ownership
                if (existingTodo.userId != caller) {
                    return #err("Unauthorized");
                };
                
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
                    userId = existingTodo.userId;
                };
                
                todos.put(todoId, updatedTodo);
                #ok(updatedTodo);
            };
        };
    };

    public shared(msg) func addSubtask(todoId: Nat, subtaskText: Text) : async Result.Result<TodoItem, Text> {
        let caller = msg.caller;
        
        if (Text.size(subtaskText) == 0) {
            return #err("Subtask text cannot be empty");
        };

        switch (todos.get(todoId)) {
            case null { #err("Todo not found") };
            case (?existingTodo) {
                // ADDED: Check user ownership
                if (existingTodo.userId != caller) {
                    return #err("Unauthorized");
                };
                
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
                    completed = false;
                    createdAt = existingTodo.createdAt;
                    updatedAt = Time.now();
                    userId = existingTodo.userId;
                };
                
                todos.put(todoId, updatedTodo);
                #ok(updatedTodo);
            };
        };
    };

    public shared(msg) func deleteTodo(id: Nat) : async Result.Result<(), Text> {
        let caller = msg.caller;
        
        switch (todos.get(id)) {
            case null { #err("Todo not found") };
            case (?todo) {
                if (todo.userId != caller) {
                    return #err("Unauthorized");
                };
                todos.delete(id);
                #ok(());
            };
        };
    };

    // Note CRUD operations - UPDATED with user authentication
    public shared(msg) func createNote(request: CreateNoteRequest) : async Result.Result<Note, Text> {
        let caller = msg.caller;
        
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
            userId = caller; // ADDED: Associate with user
        };

        notes.put(nextNoteId, note);
        nextNoteId += 1;
        #ok(note);
    };

    public shared(msg) func getNote(id: Nat) : async ?Note {
        let caller = msg.caller;
        switch (notes.get(id)) {
            case (?note) {
                if (note.userId == caller) { ?note } else { null }
            };
            case null { null };
        };
    };

    public shared(msg) func getAllNotes() : async [Note] {
        let caller = msg.caller;
        getUserNotes(caller);
    };

    public shared(msg) func updateNote(id: Nat, title: ?Text, description: ?Text, tags: ?[Text]) : async Result.Result<Note, Text> {
        let caller = msg.caller;
        
        switch (notes.get(id)) {
            case null { #err("Note not found") };
            case (?existingNote) {
                // ADDED: Check user ownership
                if (existingNote.userId != caller) {
                    return #err("Unauthorized");
                };
                
                let updatedNote: Note = {
                    id = existingNote.id;
                    title = Option.get(title, existingNote.title);
                    description = Option.get(description, existingNote.description);
                    tags = Option.get(tags, existingNote.tags);
                    createdAt = existingNote.createdAt;
                    updatedAt = Time.now();
                    userId = existingNote.userId;
                };
                notes.put(id, updatedNote);
                #ok(updatedNote);
            };
        };
    };

    public shared(msg) func deleteNote(id: Nat) : async Result.Result<(), Text> {
        let caller = msg.caller;
        
        switch (notes.get(id)) {
            case null { #err("Note not found") };
            case (?note) {
                if (note.userId != caller) {
                    return #err("Unauthorized");
                };
                notes.delete(id);
                #ok(());
            };
        };
    };

    // Utility functions - UPDATED for user-specific data
    public shared(msg) func getTodosByTag(tag: Text) : async [TodoItem] {
        let caller = msg.caller;
        let userTodos = getUserTodos(caller);
        Array.filter<TodoItem>(userTodos, func(todo: TodoItem): Bool {
            Array.find<Text>(todo.tags, func(t: Text): Bool { t == tag }) != null
        });
    };

    public shared(msg) func getNotesByTag(tag: Text) : async [Note] {
        let caller = msg.caller;
        let userNotes = getUserNotes(caller);
        Array.filter<Note>(userNotes, func(note: Note): Bool {
            Array.find<Text>(note.tags, func(t: Text): Bool { t == tag }) != null
        });
    };

    public shared(msg) func getTodosByPriority(priority: Priority) : async [TodoItem] {
        let caller = msg.caller;
        let userTodos = getUserTodos(caller);
        Array.filter<TodoItem>(userTodos, func(todo: TodoItem): Bool {
            todo.priority == priority
        });
    };

    public shared(msg) func getCompletedTodos() : async [TodoItem] {
        let caller = msg.caller;
        let userTodos = getUserTodos(caller);
        Array.filter<TodoItem>(userTodos, func(todo: TodoItem): Bool {
            todo.completed
        });
    };

    public shared(msg) func getPendingTodos() : async [TodoItem] {
        let caller = msg.caller;
        let userTodos = getUserTodos(caller);
        Array.filter<TodoItem>(userTodos, func(todo: TodoItem): Bool {
            not todo.completed
        });
    };

    // FIXED: Statistics with correct iterator usage
    public shared(msg) func getStats() : async {
        totalTodos: Nat;
        completedTodos: Nat;
        pendingTodos: Nat;
        totalNotes: Nat;
        totalSubtasks: Nat;
        completedSubtasks: Nat;
    } {
        let caller = msg.caller;
        let userTodos = getUserTodos(caller);
        let completedTodos = Array.filter<TodoItem>(userTodos, func(todo: TodoItem): Bool { todo.completed });
        
        var totalSubtasks = 0;
        var completedSubtasks = 0;
        
        // FIXED: Proper iterator usage
        for (todo in userTodos.vals()) {
            totalSubtasks += todo.subtasks.size();
            for (subtask in todo.subtasks.vals()) {
                if (subtask.completed) {
                    completedSubtasks += 1;
                };
            };
        };

        {
            totalTodos = userTodos.size();
            completedTodos = completedTodos.size();
            pendingTodos = userTodos.size() - completedTodos.size();
            totalNotes = getUserNotes(caller).size();
            totalSubtasks = totalSubtasks;
            completedSubtasks = completedSubtasks;
        };
    };

    // Search functionality - UPDATED for user-specific data
    public shared(msg) func searchTodos(searchText: Text) : async [TodoItem] {
        let caller = msg.caller;
        let userTodos = getUserTodos(caller);
        let lowerQuery = toLowercase(searchText);
        
        Array.filter<TodoItem>(userTodos, func(todo: TodoItem): Bool {
            let lowerTitle = toLowercase(todo.title);
            let lowerDesc = toLowercase(todo.description);
            
            Text.contains(lowerTitle, #text lowerQuery) or Text.contains(lowerDesc, #text lowerQuery)
        });
    };

    public shared(msg) func searchNotes(searchText: Text) : async [Note] {
        let caller = msg.caller;
        let userNotes = getUserNotes(caller);
        let lowerQuery = toLowercase(searchText);
        
        Array.filter<Note>(userNotes, func(note: Note): Bool {
            let lowerTitle = toLowercase(note.title);
            let lowerDesc = toLowercase(note.description);
            
            Text.contains(lowerTitle, #text lowerQuery) or Text.contains(lowerDesc, #text lowerQuery)
        })
    };

    // ADDED: Health check
    public query func healthCheck() : async Text {
        "Todo/Notes backend is healthy. Total todos: " # debug_show(todos.size()) # ", Total notes: " # debug_show(notes.size())
    };
}