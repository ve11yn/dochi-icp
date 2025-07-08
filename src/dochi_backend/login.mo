import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Option "mo:base/Option";
import Int "mo:base/Int";

actor LoginBackend {
    // Types
    public type User = {
        name: Text;
        principal: Text;
        createdAt: Int;
        updatedAt: Int;
        isActive: Bool;
    };

    public type LoginError = {
        #NotFound;
        #AlreadyExists;
        #NotAuthorized;
        #InvalidInput;
        #UserInactive;
        #SystemError;
    };

    public type AuthResponse = {
        user: User;
        isFirstTime: Bool;
        sessionToken: Text;
    };

    public type LoginStats = {
        totalUsers: Nat;
        activeUsers: Nat;
        totalLogins: Nat;
        lastLogin: ?Int;
    };

    // State variables
    private stable var userEntries: [(Principal, User)] = [];
    private stable var loginCountEntries: [(Principal, Nat)] = [];
    private stable var lastLoginEntries: [(Principal, Int)] = [];
    private stable var totalLoginCount: Nat = 0;
    private stable var systemStartTime: Int = Time.now();

    // In-memory hashmaps
    private var users = HashMap.HashMap<Principal, User>(0, Principal.equal, Principal.hash);
    private var loginCounts = HashMap.HashMap<Principal, Nat>(0, Principal.equal, Principal.hash);
    private var lastLogins = HashMap.HashMap<Principal, Int>(0, Principal.equal, Principal.hash);

    // Constants
    private let MAX_NAME_LENGTH: Nat = 50;
    private let MIN_NAME_LENGTH: Nat = 1;

    // Upgrade hooks
    system func preupgrade() {
        userEntries := Iter.toArray(users.entries());
        loginCountEntries := Iter.toArray(loginCounts.entries());
        lastLoginEntries := Iter.toArray(lastLogins.entries());
        Debug.print("Pre-upgrade: Saved " # debug_show(userEntries.size()) # " users");
    };

    system func postupgrade() {
        users := HashMap.fromIter<Principal, User>(
            userEntries.vals(), 
            userEntries.size(), 
            Principal.equal, 
            Principal.hash
        );
        loginCounts := HashMap.fromIter<Principal, Nat>(
            loginCountEntries.vals(), 
            loginCountEntries.size(), 
            Principal.equal, 
            Principal.hash
        );
        lastLogins := HashMap.fromIter<Principal, Int>(
            lastLoginEntries.vals(), 
            lastLoginEntries.size(), 
            Principal.equal, 
            Principal.hash
        );
        
        userEntries := [];
        loginCountEntries := [];
        lastLoginEntries := [];
        
        Debug.print("Post-upgrade: Restored " # debug_show(users.size()) # " users");
    };

    // Helper functions
    private func validateName(name: Text): Bool {
        let trimmed = Text.trim(name, #char ' ');
        let size = Text.size(trimmed);
        size >= MIN_NAME_LENGTH and size <= MAX_NAME_LENGTH
    };

    private func sanitizeName(name: Text): Text {
        Text.trim(name, #char ' ')
    };

    private func generateSessionToken(principal: Principal): Text {
        let timestamp = Time.now();
        Principal.toText(principal) # "_" # Int.toText(timestamp)
    };

    private func updateLoginStats(caller: Principal) {
        // Update login count
        let currentCount = Option.get(loginCounts.get(caller), 0);
        loginCounts.put(caller, currentCount + 1);
        
        // Update last login time
        lastLogins.put(caller, Time.now());
        
        // Update total login count
        totalLoginCount += 1;
    };

    private func isAnonymous(principal: Principal): Bool {
        Principal.toText(principal) == "2vxsx-fae"
    };

    // Public functions

    // Health check
    public query func healthCheck(): async Text {
        "Login backend is healthy. Users: " # debug_show(users.size()) # 
        ", Total logins: " # debug_show(totalLoginCount)
    };

    // Check if user exists
    public shared(msg) func checkUserExists(): async ?User {
        let caller = msg.caller;
        
        if (isAnonymous(caller)) {
            return null;
        };
        
        switch (users.get(caller)) {
            case (?user) {
                if (user.isActive) { ?user } else { null }
            };
            case null { null };
        }
    };

    // Create user profile (first time registration)
    public shared(msg) func createUserProfile(name: Text): async Result.Result<User, LoginError> {
        let caller = msg.caller;
        
        if (isAnonymous(caller)) {
            return #err(#NotAuthorized);
        };

        // Validate input
        if (not validateName(name)) {
            Debug.print("Invalid name provided: " # name);
            return #err(#InvalidInput);
        };

        // Check if user already exists
        switch (users.get(caller)) {
            case (?existingUser) { 
                if (existingUser.isActive) {
                    #err(#AlreadyExists)
                } else {
                    // Reactivate user
                    let reactivatedUser: User = {
                        name = sanitizeName(name);
                        principal = Principal.toText(caller);
                        createdAt = existingUser.createdAt;
                        updatedAt = Time.now();
                        isActive = true;
                    };
                    users.put(caller, reactivatedUser);
                    updateLoginStats(caller);
                    Debug.print("Reactivated user: " # Principal.toText(caller));
                    #ok(reactivatedUser)
                }
            };
            case null {
                let newUser: User = {
                    name = sanitizeName(name);
                    principal = Principal.toText(caller);
                    createdAt = Time.now();
                    updatedAt = Time.now();
                    isActive = true;
                };
                
                users.put(caller, newUser);
                updateLoginStats(caller);
                Debug.print("Created new user: " # Principal.toText(caller) # " with name: " # newUser.name);
                #ok(newUser)
            };
        }
    };

    // Login user
    public shared(msg) func loginUser(): async Result.Result<AuthResponse, LoginError> {
        let caller = msg.caller;
        
        if (isAnonymous(caller)) {
            return #err(#NotAuthorized);
        };
        
        switch (users.get(caller)) {
            case (?user) { 
                if (not user.isActive) {
                    return #err(#UserInactive);
                };
                
                updateLoginStats(caller);
                let sessionToken = generateSessionToken(caller);
                
                Debug.print("User logged in: " # Principal.toText(caller));
                #ok({
                    user = user;
                    isFirstTime = false;
                    sessionToken = sessionToken;
                })
            };
            case null { 
                Debug.print("First time user detected: " # Principal.toText(caller));
                #err(#NotFound)
            };
        }
    };

    // Update user profile
    public shared(msg) func updateUserProfile(name: Text): async Result.Result<User, LoginError> {
        let caller = msg.caller;
        
        if (isAnonymous(caller)) {
            return #err(#NotAuthorized);
        };

        // Validate input
        if (not validateName(name)) {
            return #err(#InvalidInput);
        };
        
        switch (users.get(caller)) {
            case null { #err(#NotFound) };
            case (?existingUser) {
                if (not existingUser.isActive) {
                    return #err(#UserInactive);
                };
                
                let updatedUser: User = {
                    name = sanitizeName(name);
                    principal = existingUser.principal;
                    createdAt = existingUser.createdAt;
                    updatedAt = Time.now();
                    isActive = true;
                };
                
                users.put(caller, updatedUser);
                Debug.print("Updated user profile for: " # Principal.toText(caller));
                #ok(updatedUser)
            };
        }
    };

    // Get current user's profile
    public shared query(msg) func getMyProfile(): async ?User {
        let caller = msg.caller;
        
        if (isAnonymous(caller)) {
            return null;
        };
        
        switch (users.get(caller)) {
            case (?user) {
                if (user.isActive) { ?user } else { null }
            };
            case null { null };
        }
    };

    // Get user profile by principal (public read)
    public query func getUserProfile(principal: Principal): async ?User {
        switch (users.get(principal)) {
            case (?user) {
                if (user.isActive) { ?user } else { null }
            };
            case null { null };
        }
    };

    // Deactivate user (soft delete)
    public shared(msg) func deactivateUser(): async Result.Result<Bool, LoginError> {
        let caller = msg.caller;
        
        if (isAnonymous(caller)) {
            return #err(#NotAuthorized);
        };
        
        switch (users.get(caller)) {
            case null { #err(#NotFound) };
            case (?user) {
                let deactivatedUser: User = {
                    name = user.name;
                    principal = user.principal;
                    createdAt = user.createdAt;
                    updatedAt = Time.now();
                    isActive = false;
                };
                
                users.put(caller, deactivatedUser);
                Debug.print("Deactivated user: " # Principal.toText(caller));
                #ok(true)
            };
        }
    };

    // Delete user profile permanently
    public shared(msg) func deleteUserProfile(): async Result.Result<Bool, LoginError> {
        let caller = msg.caller;
        
        if (isAnonymous(caller)) {
            return #err(#NotAuthorized);
        };
        
        switch (users.remove(caller)) {
            case null { #err(#NotFound) };
            case (?_) {
                // Also remove from other maps
                ignore loginCounts.remove(caller);
                ignore lastLogins.remove(caller);
                
                Debug.print("Permanently deleted user: " # Principal.toText(caller));
                #ok(true)
            };
        }
    };

    // Get login statistics
    public query func getLoginStats(): async LoginStats {
        var activeUserCount = 0;
        var lastLoginTime: ?Int = null;
        
        for ((principal, user) in users.entries()) {
            if (user.isActive) {
                activeUserCount += 1;
            };
        };
        
        for ((principal, loginTime) in lastLogins.entries()) {
            switch (lastLoginTime) {
                case null { lastLoginTime := ?loginTime };
                case (?currentMax) {
                    if (loginTime > currentMax) {
                        lastLoginTime := ?loginTime;
                    };
                };
            };
        };
        
        {
            totalUsers = users.size();
            activeUsers = activeUserCount;
            totalLogins = totalLoginCount;
            lastLogin = lastLoginTime;
        }
    };

    // Get user login history
    public shared query(msg) func getMyLoginHistory(): async ?{
        loginCount: Nat;
        lastLogin: ?Int;
        accountCreated: Int;
    } {
        let caller = msg.caller;
        
        if (isAnonymous(caller)) {
            return null;
        };
        
        switch (users.get(caller)) {
            case null { null };
            case (?user) {
                ?{
                    loginCount = Option.get(loginCounts.get(caller), 0);
                    lastLogin = lastLogins.get(caller);
                    accountCreated = user.createdAt;
                }
            };
        }
    };

    // Admin function to get all users (for debugging)
    public query func getAllUsers(): async [(Principal, User)] {
        Iter.toArray(users.entries())
    };

    // System information
    public query func getSystemInfo(): async {
        startTime: Int;
        currentTime: Int;
        uptime: Int;
        version: Text;
    } {
        let currentTime = Time.now();
        {
            startTime = systemStartTime;
            currentTime = currentTime;
            uptime = currentTime - systemStartTime;
            version = "1.0.0";
        }
    };
}