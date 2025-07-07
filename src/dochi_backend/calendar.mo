import Time "mo:base/Time";
import Text "mo:base/Text";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Buffer "mo:base/Buffer";
import Order "mo:base/Order";
import Nat32 "mo:base/Nat32";

actor CalendarBackend {
    // Type definitions
    public type AppointmentId = Nat;
    public type UserId = Principal;
    
    public type Category = {
        name: Text;
        color: Text;
        textColor: Text;
    };
    
    public type Appointment = {
        id: AppointmentId;
        title: Text;
        startTime: Text;
        endTime: Text;
        color: Text;
        category: Text;
        completed: Bool;
        date: Text; // Format: YYYY-MM-DD
        userId: UserId;
        createdAt: Time.Time;
        updatedAt: Time.Time;
    };
    
    public type CreateAppointmentRequest = {
        title: Text;
        startTime: Text;
        endTime: Text;
        category: Text;
        date: Text;
    };
    
    public type UpdateAppointmentRequest = {
        id: AppointmentId;
        title: ?Text;
        startTime: ?Text;
        endTime: ?Text;
        category: ?Text;
        completed: ?Bool;
    };
    
    public type UserProfile = {
        userId: UserId;
        categories: [Category];
        createdAt: Time.Time;
    };
    
    // State variables
    private stable var nextAppointmentId: AppointmentId = 1;
    private stable var appointmentsEntries: [(AppointmentId, Appointment)] = [];
    private stable var userProfilesEntries: [(UserId, UserProfile)] = [];
    
    // HashMaps for efficient lookups
    private var appointments = HashMap.HashMap<AppointmentId, Appointment>(0, Nat.equal, Nat32.fromNat);
    private var userProfiles = HashMap.HashMap<UserId, UserProfile>(0, Principal.equal, Principal.hash);
    
    // System upgrade hooks
    system func preupgrade() {
        appointmentsEntries := Iter.toArray(appointments.entries());
        userProfilesEntries := Iter.toArray(userProfiles.entries());
    };
    
    system func postupgrade() {
        appointments := HashMap.fromIter<AppointmentId, Appointment>(
            appointmentsEntries.vals(), 
            appointmentsEntries.size(), 
            Nat.equal, 
            Nat32.fromNat
        );
        userProfiles := HashMap.fromIter<UserId, UserProfile>(
            userProfilesEntries.vals(), 
            userProfilesEntries.size(), 
            Principal.equal, 
            Principal.hash
        );
        appointmentsEntries := [];
        userProfilesEntries := [];
    };
    
    // Default categories
    private func getDefaultCategories(): [Category] {
        [
            { name = "Work"; color = "#8B5CF6"; textColor = "text-white" },
            { name = "Personal"; color = "#10B981"; textColor = "text-white" },
            { name = "Others"; color = "#6B7280"; textColor = "text-white" },
            { name = "Urgent"; color = "#EF4444"; textColor = "text-white" }
        ]
    };
    
    // Initialize user profile if not exists
    private func initializeUserProfile(userId: UserId): UserProfile {
        let profile = {
            userId = userId;
            categories = getDefaultCategories();
            createdAt = Time.now();
        };
        userProfiles.put(userId, profile);
        profile
    };
    
    // Get user profile or create if not exists
    public shared(msg) func getUserProfile(userId: UserId): async UserProfile {
        switch (userProfiles.get(userId)) {
            case (?profile) { profile };
            case null { initializeUserProfile(userId) };
        }
    };
    
    // Category management
    public shared(msg) func addCategory(userId: UserId, category: Category): async Result.Result<Text, Text> {
        let caller = msg.caller;
        
        // Only allow users to manage their own categories
        if (caller != userId) {
            return #err("Unauthorized");
        };
        
        let profile = switch (userProfiles.get(userId)) {
            case (?p) { p };
            case null { initializeUserProfile(userId) };
        };
        
        // Check if category already exists
        let exists = Array.find<Category>(profile.categories, func(c) = c.name == category.name);
        if (Option.isSome(exists)) {
            return #err("Category already exists");
        };
        
        let updatedCategories = Array.append(profile.categories, [category]);
        let updatedProfile = {
            userId = profile.userId;
            categories = updatedCategories;
            createdAt = profile.createdAt;
        };
        
        userProfiles.put(userId, updatedProfile);
        #ok("Category added successfully")
    };
    
    public shared(msg) func deleteCategory(userId: UserId, categoryName: Text): async Result.Result<Text, Text> {
        let caller = msg.caller;
        
        // Only allow users to manage their own categories
        if (caller != userId) {
            return #err("Unauthorized");
        };
        
        let profile = switch (userProfiles.get(userId)) {
            case (?p) { p };
            case null { return #err("User profile not found") };
        };
        
        // Prevent deleting the last category
        if (profile.categories.size() <= 1) {
            return #err("Cannot delete the last category");
        };
        
        let updatedCategories = Array.filter<Category>(profile.categories, func(c) = c.name != categoryName);
        
        if (updatedCategories.size() == profile.categories.size()) {
            return #err("Category not found");
        };
        
        let updatedProfile = {
            userId = profile.userId;
            categories = updatedCategories;
            createdAt = profile.createdAt;
        };
        
        userProfiles.put(userId, updatedProfile);
        #ok("Category deleted successfully")
    };
    
    // Create appointment
    public shared(msg) func createAppointment(userId: UserId, request: CreateAppointmentRequest): async Result.Result<Appointment, Text> {
        let caller = msg.caller;
        
        // Only allow users to create their own appointments
        if (caller != userId) {
            return #err("Unauthorized");
        };
        
        let profile = switch (userProfiles.get(userId)) {
            case (?p) { p };
            case null { initializeUserProfile(userId) };
        };
        
        // Find category
        let categoryOpt = Array.find<Category>(profile.categories, func(c) = c.name == request.category);
        let category = switch (categoryOpt) {
            case (?c) { c };
            case null { return #err("Category not found") };
        };
        
        let appointment: Appointment = {
            id = nextAppointmentId;
            title = request.title;
            startTime = request.startTime;
            endTime = request.endTime;
            color = category.color;
            category = request.category;
            completed = false;
            date = request.date;
            userId = userId;
            createdAt = Time.now();
            updatedAt = Time.now();
        };
        
        appointments.put(nextAppointmentId, appointment);
        nextAppointmentId += 1;
        
        #ok(appointment)
    };
    
    // Update appointment
    public shared(msg) func updateAppointment(userId: UserId, request: UpdateAppointmentRequest): async Result.Result<Appointment, Text> {
        let caller = msg.caller;
        
        switch (appointments.get(request.id)) {
            case (?appointment) {
                // Check if user owns this appointment and is the caller
                if (appointment.userId != userId or caller != userId) {
                    return #err("Unauthorized");
                };
                
                // Get user profile to validate category if provided
                let profile = switch (userProfiles.get(userId)) {
                    case (?p) { p };
                    case null { return #err("User profile not found") };
                };
                
                // If category is being updated, validate it exists
                let newColor = switch (request.category) {
                    case (?categoryName) {
                        let categoryOpt = Array.find<Category>(profile.categories, func(c) = c.name == categoryName);
                        switch (categoryOpt) {
                            case (?c) { c.color };
                            case null { return #err("Category not found") };
                        };
                    };
                    case null { appointment.color };
                };
                
                let updatedAppointment: Appointment = {
                    id = appointment.id;
                    title = Option.get(request.title, appointment.title);
                    startTime = Option.get(request.startTime, appointment.startTime);
                    endTime = Option.get(request.endTime, appointment.endTime);
                    color = newColor;
                    category = Option.get(request.category, appointment.category);
                    completed = Option.get(request.completed, appointment.completed);
                    date = appointment.date;
                    userId = appointment.userId;
                    createdAt = appointment.createdAt;
                    updatedAt = Time.now();
                };
                
                appointments.put(request.id, updatedAppointment);
                #ok(updatedAppointment)
            };
            case null { #err("Appointment not found") };
        }
    };
    
    // Delete appointment
    public shared(msg) func deleteAppointment(userId: UserId, appointmentId: AppointmentId): async Result.Result<Text, Text> {
        let caller = msg.caller;
        
        switch (appointments.get(appointmentId)) {
            case (?appointment) {
                if (appointment.userId != userId or caller != userId) {
                    return #err("Unauthorized");
                };
                appointments.delete(appointmentId);
                #ok("Appointment deleted successfully")
            };
            case null { #err("Appointment not found") };
        }
    };
    
    // Get appointments by date range
    public query func getAppointmentsByDateRange(userId: UserId, startDate: Text, endDate: Text): async [Appointment] {
        let userAppointments = Iter.toArray(
            Iter.filter(
                appointments.vals(),
                func(apt: Appointment): Bool {
                    apt.userId == userId and 
                    apt.date >= startDate and 
                    apt.date <= endDate
                }
            )
        );
        
        // Sort by date and start time
        Array.sort(userAppointments, func(a: Appointment, b: Appointment): Order.Order {
            switch (Text.compare(a.date, b.date)) {
                case (#equal) { Text.compare(a.startTime, b.startTime) };
                case (other) { other };
            }
        })
    };
    
    // Get appointments for a specific date
    public query func getAppointmentsByDate(userId: UserId, date: Text): async [Appointment] {
        let userAppointments = Iter.toArray(
            Iter.filter(
                appointments.vals(),
                func(apt: Appointment): Bool {
                    apt.userId == userId and apt.date == date
                }
            )
        );
        
        // Sort by start time
        Array.sort(userAppointments, func(a: Appointment, b: Appointment): Order.Order {
            Text.compare(a.startTime, b.startTime)
        })
    };
    
    // Get all appointments for a user
    public query func getAllAppointments(userId: UserId): async [Appointment] {
        let userAppointments = Iter.toArray(
            Iter.filter(
                appointments.vals(),
                func(apt: Appointment): Bool { apt.userId == userId }
            )
        );
        
        // Sort by date and start time
        Array.sort(userAppointments, func(a: Appointment, b: Appointment): Order.Order {
            switch (Text.compare(a.date, b.date)) {
                case (#equal) { Text.compare(a.startTime, b.startTime) };
                case (other) { other };
            }
        })
    };
    
    // Toggle appointment completion status
    public shared(msg) func toggleAppointmentCompletion(userId: UserId, appointmentId: AppointmentId): async Result.Result<Appointment, Text> {
        let caller = msg.caller;
        
        switch (appointments.get(appointmentId)) {
            case (?appointment) {
                if (appointment.userId != userId or caller != userId) {
                    return #err("Unauthorized");
                };
                
                let updatedAppointment = {
                    id = appointment.id;
                    title = appointment.title;
                    startTime = appointment.startTime;
                    endTime = appointment.endTime;
                    color = appointment.color;
                    category = appointment.category;
                    completed = not appointment.completed;
                    date = appointment.date;
                    userId = appointment.userId;
                    createdAt = appointment.createdAt;
                    updatedAt = Time.now();
                };
                
                appointments.put(appointmentId, updatedAppointment);
                #ok(updatedAppointment)
            };
            case null { #err("Appointment not found") };
        }
    };
    
    // Get appointments grouped by date for efficient frontend rendering
    public query func getAppointmentsGroupedByDate(userId: UserId): async [(Text, [Appointment])] {
        let userAppointments = Iter.toArray(
            Iter.filter(
                appointments.vals(),
                func(apt: Appointment): Bool { apt.userId == userId }
            )
        );
        
        // Group by date
        let dateMap = HashMap.HashMap<Text, Buffer.Buffer<Appointment>>(0, Text.equal, Text.hash);
        
        for (apt in userAppointments.vals()) {
            switch (dateMap.get(apt.date)) {
                case (?buffer) { buffer.add(apt) };
                case null {
                    let buffer = Buffer.Buffer<Appointment>(1);
                    buffer.add(apt);
                    dateMap.put(apt.date, buffer);
                };
            };
        };
        
        // Convert to array and sort
        let entriesArray = Iter.toArray(dateMap.entries());
        let grouped = Array.map<(Text, Buffer.Buffer<Appointment>), (Text, [Appointment])>(
            entriesArray,
            func(entry: (Text, Buffer.Buffer<Appointment>)): (Text, [Appointment]) {
                let date = entry.0;
                let buffer = entry.1;
                let appointments = Buffer.toArray(buffer);
                let sorted = Array.sort(appointments, func(a: Appointment, b: Appointment): Order.Order {
                    Text.compare(a.startTime, b.startTime)
                });
                (date, sorted)
            }
        );
        
        // Sort by date
        Array.sort(grouped, func(a: (Text, [Appointment]), b: (Text, [Appointment])): Order.Order {
            Text.compare(a.0, b.0)
        })
    };

    // Health check
    public query func healthCheck() : async Text {
        "Calendar canister is healthy. Appointments: " # debug_show(appointments.size()) # ", Profiles: " # debug_show(userProfiles.size())
    };
}