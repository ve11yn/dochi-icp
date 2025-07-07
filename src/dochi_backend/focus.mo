import Map "mo:base/HashMap";
import Text "mo:base/Text";
import Iter "mo:base/Iter";

actor FocusTracker {
    
    // Simple storage: date -> total minutes for that date
    private stable var focusDataEntries: [(Text, Nat)] = [];
    private var focusData = Map.fromIter<Text, Nat>(
        focusDataEntries.vals(), 10, Text.equal, Text.hash
    );
    
    // Add focus time to a date
    public func addFocusTime(date: Text, duration: Nat) : async Bool {
        switch (focusData.get(date)) {
            case (?existingTime) {
                focusData.put(date, existingTime + duration);
            };
            case null {
                focusData.put(date, duration);
            };
        };
        true
    };
    
    // Get focus time for a specific date
    public query func getFocusTime(date: Text) : async Nat {
        switch (focusData.get(date)) {
            case (?time) { time };
            case null { 0 };
        }
    };
    
    // Get all focus data
    public query func getAllFocusData() : async [(Text, Nat)] {
        Iter.toArray(focusData.entries())
    };
    
    // System functions for upgrades
    system func preupgrade() {
        focusDataEntries := Iter.toArray(focusData.entries());
    };
    
    system func postupgrade() {
        focusDataEntries := [];
    };
}