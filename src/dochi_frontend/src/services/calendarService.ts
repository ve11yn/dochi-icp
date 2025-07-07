// dochi_frontend/src/services/calendarService.ts
import { Actor, ActorSubclass, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

// FIXED: Correct import paths for your project structure
import { idlFactory, canisterId as declaredCanisterId } from '../../../declarations/calendar_backend';
import type { 
  _SERVICE, 
  Appointment as BackendAppointment, 
  Category as BackendCategory,
  CreateAppointmentRequest,
  UpdateAppointmentRequest
} from '../../../declarations/calendar_backend/calendar_backend.did';

// Frontend types to match your calendar.tsx component
export interface Appointment {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  color: string;
  category: string;
  completed: boolean;
  date: string; // Added missing date field
}

export interface Category {
  name: string;
  color: string;
  textColor: string;
}

const getActor = async (): Promise<ActorSubclass<_SERVICE>> => {
  const authClient = await AuthClient.create();

  if (!(await authClient.isAuthenticated())) {
    throw new Error("User not authenticated");
  }

  const identity = authClient.getIdentity();
  
  // Get canister ID with fallback
  const canisterId = declaredCanisterId || process.env.CANISTER_ID_CALENDAR_BACKEND;
  
  if (!canisterId) {
    throw new Error('Calendar backend canister ID not found. Make sure the canister is deployed.');
  }

  // FIXED: Correct host configuration
  const host = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:4943' 
    : 'https://ic0.app';

  const agent = new HttpAgent({
    identity,
    host,
  });

  // FIXED: Correct environment check
  if (process.env.NODE_ENV === 'development') {
    await agent.fetchRootKey().catch(err => {
      console.warn("Unable to fetch root key. Check that your local replica is running.");
      console.error(err);
    });
  }

  return Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId,
  });
};

// FIXED: Include all required fields from backend
const formatAppointment = (apt: BackendAppointment): Appointment => ({
  id: Number(apt.id),
  title: apt.title,
  startTime: apt.startTime,
  endTime: apt.endTime,
  color: apt.color,
  category: apt.category,
  completed: apt.completed,
  date: apt.date, // Include date field
});

export const calendarService = {
  getInitialData: async (): Promise<{ 
    appointments: { [date: string]: Appointment[] }, 
    categories: Category[] 
  }> => {
    const actor = await getActor();
    const authClient = await AuthClient.create();
    const principal = authClient.getIdentity().getPrincipal();

    const [appointmentsResult, profileResult] = await Promise.all([
      actor.getAppointmentsGroupedByDate(principal),
      actor.getUserProfile(principal)
    ]);

    const appointments: { [date: string]: Appointment[] } = {};
    for (const [date, apts] of appointmentsResult) {
      appointments[date] = apts.map(formatAppointment);
    }

    const categories: Category[] = profileResult.categories;
    return { appointments, categories };
  },

  createAppointment: async (appointmentData: CreateAppointmentRequest): Promise<Appointment> => {
    const actor = await getActor();
    const authClient = await AuthClient.create();
    const principal = authClient.getIdentity().getPrincipal();

    const result = await actor.createAppointment(principal, appointmentData);
    if ('ok' in result) {
      return formatAppointment(result.ok);
    } else {
      throw new Error(result.err);
    }
  },

  updateAppointment: async (updateData: UpdateAppointmentRequest): Promise<Appointment> => {
    const actor = await getActor();
    const authClient = await AuthClient.create();
    const principal = authClient.getIdentity().getPrincipal();

    const result = await actor.updateAppointment(principal, updateData);
    if ('ok' in result) {
      return formatAppointment(result.ok);
    } else {
      throw new Error(result.err);
    }
  },

  deleteAppointment: async (appointmentId: number): Promise<void> => {
    const actor = await getActor();
    const authClient = await AuthClient.create();
    const principal = authClient.getIdentity().getPrincipal();

    const result = await actor.deleteAppointment(principal, BigInt(appointmentId));
    if ('err' in result) {
      throw new Error(result.err);
    }
  },

  getAppointmentsByDate: async (date: string): Promise<Appointment[]> => {
    const actor = await getActor();
    const authClient = await AuthClient.create();
    const principal = authClient.getIdentity().getPrincipal();

    const appointments = await actor.getAppointmentsByDate(principal, date);
    return appointments.map(formatAppointment);
  },

  addCategory: async (category: Category): Promise<void> => {
    const actor = await getActor();
    const authClient = await AuthClient.create();
    const principal = authClient.getIdentity().getPrincipal();

    const result = await actor.addCategory(principal, category);
    if ('err' in result) {
      throw new Error(result.err);
    }
  },

  deleteCategory: async (categoryName: string): Promise<void> => {
    const actor = await getActor();
    const authClient = await AuthClient.create();
    const principal = authClient.getIdentity().getPrincipal();

    const result = await actor.deleteCategory(principal, categoryName);
    if ('err' in result) {
      throw new Error(result.err);
    }
  },

  toggleAppointmentCompletion: async (appointmentId: number): Promise<Appointment> => {
    const actor = await getActor();
    const authClient = await AuthClient.create();
    const principal = authClient.getIdentity().getPrincipal();

    const result = await actor.toggleAppointmentCompletion(principal, BigInt(appointmentId));
    if ('ok' in result) {
      return formatAppointment(result.ok);
    } else {
      throw new Error(result.err);
    }
  },
};