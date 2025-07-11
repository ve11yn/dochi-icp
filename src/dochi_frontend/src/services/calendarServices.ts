// src/dochi_frontend/src/services/calendarService.ts
import { Actor, HttpAgent } from "@dfinity/agent";
// import { idlFactory } from "../../../declarations/calendar_backend";
// import { _SERVICE } from "../../../declarations/calendar_backend/calendar_backend.did";

// Types matching your Motoko backend
export interface Appointment {
  id: bigint;
  title: string;
  startTime: string;
  endTime: string;
  color: string;
  category: string;
  completed: boolean;
}

export interface AppointmentInput {
  title: string;
  startTime: string;
  endTime: string;
  category: string;
  color: [] | [string];
}

export interface Category {
  name: string;
  color: string;
  textColor: string;
}

export interface CategoryInput {
  name: string;
  color: string;
  textColor: [] | [string];
}

// Create agent
const agent = new HttpAgent({
  host: process.env.NODE_ENV === "production" ? "https://ic0.app" : "http://localhost:8000",
});

// Fetch root key for local development
if (process.env.NODE_ENV !== "production") {
  agent.fetchRootKey().catch((err) => {
    console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
    console.error(err);
  });
}

// Create actor
const createActor = (canisterId: string): _SERVICE => {
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });
};

// Get canister ID from environment or use default
const CALENDAR_BACKEND_CANISTER_ID = 
  process.env.REACT_APP_CALENDAR_BACKEND_CANISTER_ID || 
  process.env.VITE_CALENDAR_BACKEND_CANISTER_ID || 
  "be2us-64aaa-aaaaa-qaabq-cai"; // Replace with your actual canister ID

const calendarActor = createActor(CALENDAR_BACKEND_CANISTER_ID);

// Calendar Service Class
class CalendarService {
  // Convert bigint to number for frontend use
  private convertAppointment(apt: any): Appointment {
    return {
      ...apt,
      id: Number(apt.id)
    };
  }

  // Get all appointments
  async getAppointments(): Promise<{ [date: string]: Appointment[] }> {
    try {
      const appointments = await calendarActor.getAppointments();
      const converted: { [date: string]: Appointment[] } = {};
      
      appointments.forEach(([date, apts]) => {
        converted[date] = apts.map(apt => this.convertAppointment(apt));
      });
      
      return converted;
    } catch (error) {
      console.error("Error fetching appointments:", error);
      throw error;
    }
  }

  // Get appointments by date
  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    try {
      const appointments = await calendarActor.getAppointmentsByDate(date);
      return appointments.map(apt => this.convertAppointment(apt));
    } catch (error) {
      console.error("Error fetching appointments by date:", error);
      throw error;
    }
  }

  // Create appointment
  async createAppointment(date: string, appointment: Omit<AppointmentInput, 'color'> & { color?: string }): Promise<Appointment> {
    try {
      const input: AppointmentInput = {
        ...appointment,
        color: appointment.color ? [appointment.color] : []
      };
      
      const result = await calendarActor.createAppointment(date, input);
      
      if ('ok' in result) {
        return this.convertAppointment(result.ok);
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  }

  // Update appointment
  async updateAppointment(date: string, id: number, updates: Partial<Appointment>): Promise<Appointment> {
    try {
      const updateData = {
        title: updates.title ? [updates.title] : [],
        startTime: updates.startTime ? [updates.startTime] : [],
        endTime: updates.endTime ? [updates.endTime] : [],
        category: updates.category ? [updates.category] : [],
        color: updates.color ? [updates.color] : [],
        completed: updates.completed !== undefined ? [updates.completed] : []
      };
      
      const result = await calendarActor.updateAppointment(date, BigInt(id), updateData);
      
      if ('ok' in result) {
        return this.convertAppointment(result.ok);
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      throw error;
    }
  }

  // Delete appointment
  async deleteAppointment(date: string, id: number): Promise<void> {
    try {
      const result = await calendarActor.deleteAppointment(date, BigInt(id));
      
      if ('err' in result) {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
      throw error;
    }
  }

  // Toggle appointment completion
  async toggleAppointmentComplete(date: string, id: number): Promise<Appointment> {
    try {
      const result = await calendarActor.toggleAppointmentComplete(date, BigInt(id));
      
      if ('ok' in result) {
        return this.convertAppointment(result.ok);
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error("Error toggling appointment:", error);
      throw error;
    }
  }

  // Search appointments
  async searchAppointments(query: string): Promise<{ appointment: Appointment; date: string }[]> {
    try {
      const results = await calendarActor.searchAppointments(query);
      return results.map(result => ({
        appointment: this.convertAppointment(result.appointment),
        date: result.date
      }));
    } catch (error) {
      console.error("Error searching appointments:", error);
      throw error;
    }
  }

  // Get all categories
  async getCategories(): Promise<Category[]> {
    try {
      return await calendarActor.getCategories();
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  // Create category
  async createCategory(category: Omit<CategoryInput, 'textColor'> & { textColor?: string }): Promise<Category> {
    try {
      const input: CategoryInput = {
        ...category,
        textColor: category.textColor ? [category.textColor] : []
      };
      
      const result = await calendarActor.createCategory(input);
      
      if ('ok' in result) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  }

  // Update category
  async updateCategory(name: string, updates: { newName?: string; color?: string; textColor?: string }): Promise<Category> {
    try {
      const result = await calendarActor.updateCategory(
        name,
        updates.newName ? [updates.newName] : [],
        updates.color ? [updates.color] : [],
        updates.textColor ? [updates.textColor] : []
      );
      
      if ('ok' in result) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  }

  // Delete category
  async deleteCategory(name: string): Promise<void> {
    try {
      const result = await calendarActor.deleteCategory(name);
      
      if ('err' in result) {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  }

  // Initialize sample data
  async initializeSampleData(): Promise<string> {
    try {
      return await calendarActor.initializeSampleData();
    } catch (error) {
      console.error("Error initializing sample data:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const calendarService = new CalendarService();