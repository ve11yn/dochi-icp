import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
// REMOVED: Option import (was unused)
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";
import Text "mo:base/Text";

actor Login {
    // Types specific to login functionality
    public type User = {
        name: Text;
        principal: Text;
        createdAt: Int;
    };

    public type LoginError = {
        #NotFound;
        #AlreadyExists;
        #NotAuthorized;
        #InvalidInput;
    };

    public type AuthResponse = {
        user: User;
        isFirstTime: Bool;
    };

    // Storage for user profiles
    private stable var userEntries: [(Principal, User)] = [];
    private var users = HashMap.HashMap<Principal, User>(0, Principal.equal, Principal.hash);

    // Initialize users HashMap from stable storage
    system func preupgrade() {
        userEntries := Iter.toArray(users.entries());
    };

    system func postupgrade() {
        users := HashMap.fromIter<Principal, User>(
            userEntries.vals(), 
            userEntries.size(), 
            Principal.equal, 
            Principal.hash
        );
        userEntries := [];
    };

    // Validate user input
    private func validateName(name: Text) : Bool {
        let trimmed = Text.trim(name, #char ' ');
        Text.size(trimmed) > 0 and Text.size(trimmed) <= 50
    };

    // Check if user exists and return user data
    public shared(msg) func checkUserExists() : async ?User {
        let caller = msg.caller;
        users.get(caller)
    };

    // Create new user profile (first time login)
    public shared(msg) func createUserProfile(name: Text) : async Result.Result<User, LoginError> {
        let caller = msg.caller;
        
        // Validate input
        if (not validateName(name)) {
            return #err(#InvalidInput);
        };

        // Check if user already exists
        switch (users.get(caller)) {
            case (?_existingUser) { #err(#AlreadyExists) }; // FIXED: Use wildcard for unused variable
            case null {
                let newUser: User = {
                    name = Text.trim(name, #char ' ');
                    principal = Principal.toText(caller);
                    createdAt = Time.now();
                };
                
                users.put(caller, newUser);
                Debug.print("Created user profile for: " # Principal.toText(caller) # " with name: " # newUser.name);
                #ok(newUser)
            };
        }
    };

    // Login user (checks if exists, returns user data)
    public shared(msg) func loginUser() : async Result.Result<AuthResponse, LoginError> {
        let caller = msg.caller;
        
        switch (users.get(caller)) {
            case (?user) { 
                Debug.print("User logged in: " # Principal.toText(caller));
                #ok({
                    user = user;
                    isFirstTime = false;
                })
            };
            case null { 
                Debug.print("First time user detected: " # Principal.toText(caller));
                #err(#NotFound)
            };
        }
    };

    // Update existing user profile
    public shared(msg) func updateUserProfile(name: Text) : async Result.Result<User, LoginError> {
        let caller = msg.caller;
        
        // Validate input
        if (not validateName(name)) {
            return #err(#InvalidInput);
        };
        
        switch (users.get(caller)) {
            case null { #err(#NotFound) };
            case (?existingUser) {
                let updatedUser: User = {
                    name = Text.trim(name, #char ' ');
                    principal = existingUser.principal;
                    createdAt = existingUser.createdAt;
                };
                
                users.put(caller, updatedUser);
                Debug.print("Updated user profile for: " # Principal.toText(caller));
                #ok(updatedUser)
            };
        }
    };

    // Get user profile by principal (for admin/public access)
    public query func getUserProfile(principal: Principal) : async ?User {
        users.get(principal)
    };

    // Get current user's profiles
    public query(msg) func getMyProfile() : async ?User {
        let caller = msg.caller;
        users.get(caller)
    };

    // Delete user profile (logout/delete account)
    public shared(msg) func deleteUserProfile() : async Result.Result<Bool, LoginError> {
        let caller = msg.caller;
        
        switch (users.remove(caller)) {
            case null { #err(#NotFound) };
            case (?_) {
                Debug.print("Deleted user profile for: " # Principal.toText(caller));
                #ok(true)
            };
        }
    };

    // Get statistics (for admin)
    public query func getLoginStats() : async {
        totalUsers: Nat;
        canisterMemory: Nat;
    } {
        {
            totalUsers = users.size();
            canisterMemory = users.size() * 100; // Rough estimate
        }
    };

    // Health check
    public query func healthCheck() : async Text {
        "Login canister is healthy. Users: " # debug_show(users.size())
    };
}