// main.mo
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Order "mo:base/Order";
import Debug "mo:base/Debug";

actor CalendarBackend {
    // Type definitions
    public type Appointment = {
        id: Nat;
        title: Text;
        startTime: Text;
        endTime: Text;
        color: Text;
        category: Text;
        completed: Bool;
    };

    public type AppointmentInput = {
        title: Text;
        startTime: Text;
        endTime: Text;
        category: Text;
        color: ?Text;
    };

    public type AppointmentUpdate = {
        title: ?Text;
        startTime: ?Text;
        endTime: ?Text;
        category: ?Text;
        color: ?Text;
        completed: ?Bool;
    };

    public type Category = {
        name: Text;
        color: Text;
        textColor: Text;
    };

    public type CategoryInput = {
        name: Text;
        color: Text;
        textColor: ?Text;
    };

    // State variables
    private stable var nextAppointmentId: Nat = 8; // Starting from 8 to match React initial data
    private stable var appointmentEntries: [(Text, [Appointment])] = [];
    private stable var categoryEntries: [Category] = [];
    
    // Initialize with default data
    private var appointments = HashMap.HashMap<Text, [Appointment]>(10, Text.equal, Text.hash);
    private var categories = Array.thaw<Category>([
        { name = "Work"; color = "#8B5CF6"; textColor = "text-white" },
        { name = "Personal"; color = "#10B981"; textColor = "text-white" },
        { name = "Others"; color = "#6B7280"; textColor = "text-white" },
        { name = "Urgent"; color = "#EF4444"; textColor = "text-white" }
    ]);

    // System functions for upgrades
    system func preupgrade() {
        appointmentEntries := Iter.toArray(appointments.entries());
        categoryEntries := Array.freeze(categories);
    };

    system func postupgrade() {
        appointments := HashMap.fromIter<Text, [Appointment]>(
            appointmentEntries.vals(),
            appointmentEntries.size(),
            Text.equal,
            Text.hash
        );
        categories := Array.thaw(categoryEntries);
        appointmentEntries := [];
        categoryEntries := [];
    };

    // Helper function to sort appointments by time
    private func sortAppointmentsByTime(apps: [Appointment]): [Appointment] {
        Array.sort(apps, func(a: Appointment, b: Appointment): Order.Order {
            let aMinutes = timeToMinutes(a.startTime);
            let bMinutes = timeToMinutes(b.startTime);
            if (aMinutes < bMinutes) { #less }
            else if (aMinutes > bMinutes) { #greater }
            else { #equal }
        })
    };

    // Helper function to convert time string to minutes
    private func timeToMinutes(timeStr: Text): Nat {
        let parts = Iter.toArray(Text.split(timeStr, #char ':'));
        if (parts.size() == 2) {
            let hours = Option.get(Nat.fromText(parts[0]), 0);
            let minutes = Option.get(Nat.fromText(parts[1]), 0);
            hours * 60 + minutes
        } else {
            0
        }
    };

    // Get all appointments
    public query func getAppointments(): async [(Text, [Appointment])] {
        Iter.toArray(appointments.entries())
    };

    // Get appointments for a specific date
    public query func getAppointmentsByDate(date: Text): async [Appointment] {
        switch (appointments.get(date)) {
            case null { [] };
            case (?apps) { apps };
        }
    };

    // Get appointments for a date range
    public query func getAppointmentsByDateRange(startDate: Text, endDate: Text): async [(Text, [Appointment])] {
        let entries = Iter.toArray(appointments.entries());
        Array.filter(entries, func(entry: (Text, [Appointment])): Bool {
            let date = entry.0;
            date >= startDate and date <= endDate
        })
    };

    // Create a new appointment
    public func createAppointment(date: Text, appointment: AppointmentInput): async Result.Result<Appointment, Text> {
        // Find category to get default color if not provided
        let categoryColor = switch (Array.find(Array.freeze(categories), func(c: Category): Bool { c.name == appointment.category })) {
            case null { "#6B7280" };
            case (?cat) { cat.color };
        };

        let newAppointment: Appointment = {
            id = nextAppointmentId;
            title = appointment.title;
            startTime = appointment.startTime;
            endTime = appointment.endTime;
            category = appointment.category;
            color = switch (appointment.color) {
                case null { categoryColor };
                case (?c) { c };
            };
            completed = false;
        };

        nextAppointmentId += 1;

        let currentApps = switch (appointments.get(date)) {
            case null { [] };
            case (?apps) { apps };
        };

        let updatedApps = Array.append(currentApps, [newAppointment]);
        appointments.put(date, sortAppointmentsByTime(updatedApps));

        #ok(newAppointment)
    };

    // Update an appointment
    public func updateAppointment(date: Text, id: Nat, updates: AppointmentUpdate): async Result.Result<Appointment, Text> {
        switch (appointments.get(date)) {
            case null { #err("No appointments found for this date") };
            case (?apps) {
                let updatedApps = Array.map(apps, func(apt: Appointment): Appointment {
                    if (apt.id == id) {
                        {
                            id = apt.id;
                            title = switch (updates.title) {
                                case null { apt.title };
                                case (?t) { t };
                            };
                            startTime = switch (updates.startTime) {
                                case null { apt.startTime };
                                case (?s) { s };
                            };
                            endTime = switch (updates.endTime) {
                                case null { apt.endTime };
                                case (?e) { e };
                            };
                            category = switch (updates.category) {
                                case null { apt.category };
                                case (?c) { c };
                            };
                            color = switch (updates.color) {
                                case null { apt.color };
                                case (?c) { c };
                            };
                            completed = switch (updates.completed) {
                                case null { apt.completed };
                                case (?c) { c };
                            };
                        }
                    } else {
                        apt
                    }
                });

                appointments.put(date, sortAppointmentsByTime(updatedApps));

                switch (Array.find(updatedApps, func(a: Appointment): Bool { a.id == id })) {
                    case null { #err("Appointment not found") };
                    case (?updated) { #ok(updated) };
                }
            };
        }
    };

    // Delete an appointment
    public func deleteAppointment(date: Text, id: Nat): async Result.Result<Text, Text> {
        switch (appointments.get(date)) {
            case null { #err("No appointments found for this date") };
            case (?apps) {
                let filteredApps = Array.filter(apps, func(apt: Appointment): Bool { apt.id != id });
                
                if (filteredApps.size() == apps.size()) {
                    #err("Appointment not found")
                } else {
                    if (filteredApps.size() == 0) {
                        appointments.delete(date);
                    } else {
                        appointments.put(date, filteredApps);
                    };
                    #ok("Appointment deleted successfully")
                }
            };
        }
    };

    // Move appointment to different date
    public func moveAppointment(oldDate: Text, id: Nat, newDate: Text): async Result.Result<Appointment, Text> {
        switch (appointments.get(oldDate)) {
            case null { #err("No appointments found for the original date") };
            case (?apps) {
                switch (Array.find(apps, func(a: Appointment): Bool { a.id == id })) {
                    case null { #err("Appointment not found") };
                    case (?appointment) {
                        // Remove from old date
                        let filteredOldApps = Array.filter(apps, func(apt: Appointment): Bool { apt.id != id });
                        if (filteredOldApps.size() == 0) {
                            appointments.delete(oldDate);
                        } else {
                            appointments.put(oldDate, filteredOldApps);
                        };

                        // Add to new date
                        let newDateApps = switch (appointments.get(newDate)) {
                            case null { [] };
                            case (?apps) { apps };
                        };
                        let updatedNewApps = Array.append(newDateApps, [appointment]);
                        appointments.put(newDate, sortAppointmentsByTime(updatedNewApps));

                        #ok(appointment)
                    };
                }
            };
        }
    };

    // Toggle appointment completion
    public func toggleAppointmentComplete(date: Text, id: Nat): async Result.Result<Appointment, Text> {
        switch (appointments.get(date)) {
            case null { #err("No appointments found for this date") };
            case (?apps) {
                var found = false;
                let updatedApps = Array.map(apps, func(apt: Appointment): Appointment {
                    if (apt.id == id) {
                        found := true;
                        {
                            id = apt.id;
                            title = apt.title;
                            startTime = apt.startTime;
                            endTime = apt.endTime;
                            category = apt.category;
                            color = apt.color;
                            completed = not apt.completed;
                        }
                    } else {
                        apt
                    }
                });

                if (not found) {
                    #err("Appointment not found")
                } else {
                    appointments.put(date, updatedApps);
                    switch (Array.find(updatedApps, func(a: Appointment): Bool { a.id == id })) {
                        case null { #err("Error updating appointment") };
                        case (?updated) { #ok(updated) };
                    }
                }
            };
        }
    };

    // Search appointments
    public query func searchAppointments(searchQuery: Text): async [{appointment: Appointment; date: Text}] {
        let lowerQuery = Text.toLowercase(searchQuery);
        var results: [{appointment: Appointment; date: Text}] = [];
        
        for ((date, apps) in appointments.entries()) {
            for (apt in apps.vals()) {
                if (Text.contains(Text.toLowercase(apt.title), #text lowerQuery) or
                    Text.contains(Text.toLowercase(apt.category), #text lowerQuery)) {
                    results := Array.append(results, [{appointment = apt; date = date}]);
                }
            }
        };
        
        results
    };

    // Category management

    // Get all categories
    public query func getCategories(): async [Category] {
        Array.freeze(categories)
    };

    // Create a new category
    public func createCategory(category: CategoryInput): async Result.Result<Category, Text> {
        let exists = Array.find(Array.freeze(categories), func(c: Category): Bool { c.name == category.name });
        
        switch (exists) {
            case (?_) { #err("Category already exists") };
            case null {
                let newCategory: Category = {
                    name = category.name;
                    color = category.color;
                    textColor = switch (category.textColor) {
                        case null { "text-white" };
                        case (?t) { t };
                    };
                };
                
                categories := Array.append(Array.freeze(categories), [newCategory]);
                #ok(newCategory)
            };
        }
    };

    // Update a category
    public func updateCategory(name: Text, newName: ?Text, color: ?Text, textColor: ?Text): async Result.Result<Category, Text> {
        let categoryArray = Array.freeze(categories);
        let index = Array.indexOf<Category>({ name = name; color = ""; textColor = "" }, categoryArray, func(a: Category, b: Category): Bool { a.name == b.name });
        
        switch (index) {
            case null { #err("Category not found") };
            case (?i) {
                let oldCategory = categoryArray[i];
                let updatedCategory: Category = {
                    name = switch (newName) {
                        case null { oldCategory.name };
                        case (?n) { n };
                    };
                    color = switch (color) {
                        case null { oldCategory.color };
                        case (?c) { c };
                    };
                    textColor = switch (textColor) {
                        case null { oldCategory.textColor };
                        case (?t) { t };
                    };
                };
                
                var newCategories = Array.tabulate<Category>(categoryArray.size(), func(j: Nat): Category {
                    if (j == i) { updatedCategory } else { categoryArray[j] }
                });
                
                categories := newCategories;
                
                // Update appointments with this category if name changed
                switch (newName) {
                    case null {};
                    case (?newCategoryName) {
                        for ((date, apps) in appointments.entries()) {
                            let updatedApps = Array.map(apps, func(apt: Appointment): Appointment {
                                if (apt.category == name) {
                                    {
                                        id = apt.id;
                                        title = apt.title;
                                        startTime = apt.startTime;
                                        endTime = apt.endTime;
                                        category = newCategoryName;
                                        color = apt.color;
                                        completed = apt.completed;
                                    }
                                } else {
                                    apt
                                }
                            });
                            appointments.put(date, updatedApps);
                        };
                    };
                };
                
                #ok(updatedCategory)
            };
        }
    };

    // Delete a category
    public func deleteCategory(name: Text): async Result.Result<Text, Text> {
        let categoryArray = Array.freeze(categories);
        
        if (categoryArray.size() <= 1) {
            return #err("Cannot delete the last category");
        };
        
        let filtered = Array.filter(categoryArray, func(c: Category): Bool { c.name != name });
        
        if (filtered.size() == categoryArray.size()) {
            #err("Category not found")
        } else {
            categories := Array.thaw(filtered);
            
            // Update appointments with deleted category to use first available
            let defaultCategory = filtered[0];
            for ((date, apps) in appointments.entries()) {
                let updatedApps = Array.map(apps, func(apt: Appointment): Appointment {
                    if (apt.category == name) {
                        {
                            id = apt.id;
                            title = apt.title;
                            startTime = apt.startTime;
                            endTime = apt.endTime;
                            category = defaultCategory.name;
                            color = defaultCategory.color;
                            completed = apt.completed;
                        }
                    } else {
                        apt
                    }
                });
                appointments.put(date, updatedApps);
            };
            
            #ok("Category deleted successfully")
        }
    };

    // Initialize with sample data (call this once after deployment)
    public func initializeSampleData(): async Text {
        // Clear existing data
        appointments := HashMap.HashMap<Text, [Appointment]>(10, Text.equal, Text.hash);
        
        // Add sample appointments
        appointments.put("2025-01-09", [{
            id = 1;
            title = "Product Design Course";
            startTime = "09:30";
            endTime = "12:00";
            color = "#10B981";
            category = "Personal";
            completed = false;
        }]);
        
        appointments.put("2025-01-10", [
            {
                id = 3;
                title = "Usability testing";
                startTime = "09:00";
                endTime = "11:00";
                color = "#8B5CF6";
                category = "Work";
                completed = true;
            },
            {
                id = 4;
                title = "App Design";
                startTime = "13:00";
                endTime = "15:30";
                color = "#10B981";
                category = "Personal";
                completed = false;
            }
        ]);
        
        appointments.put("2025-01-11", [{
            id = 5;
            title = "Frontend development";
            startTime = "10:00";
            endTime = "13:00";
            color = "#3B82F6";
            category = "Work";
            completed = false;
        }]);
        
        appointments.put("2025-01-12", [{
            id = 7;
            title = "Dentist Appointment";
            startTime = "14:00";
            endTime = "15:00";
            color = "#EF4444";
            category = "Urgent";
            completed = false;
        }]);
        
        "Sample data initialized successfully"
    };
}