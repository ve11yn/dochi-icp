// src/dochi_frontend/src/services/calendarServices.ts
import { Actor, HttpAgent } from "@dfinity/agent";
import { AuthClient } from '@dfinity/auth-client';
import { idlFactory, canisterId as declaredCanisterId } from '../../../declarations/calendar_backend';
import type { 
  _SERVICE,
  Appointment as BackendAppointment,
  AppointmentInput as BackendAppointmentInput,
  Category as BackendCategory,
  CategoryInput as BackendCategoryInput,
  AppointmentUpdate as BackendAppointmentUpdate
} from '../../../declarations/calendar_backend/calendar_backend.did';

// --- Frontend Type Definitions ---
export interface Appointment {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  color: string;
  category: string;
  completed: boolean;
}

export interface Category {
  name: string;
  color: string;
  textColor: string;
}

// --- Helper to create an authenticated actor ---
const getActor = async (): Promise<ActorSubclass<_SERVICE>> => {
  const authClient = await AuthClient.create();
  if (!(await authClient.isAuthenticated())) {
    throw new Error("User not authenticated");
  }

  const identity = authClient.getIdentity();
  const canisterId = declaredCanisterId || process.env.CANISTER_ID_CALENDAR_BACKEND;
  
  if (!canisterId) {
    throw new Error("Calendar backend canister ID not found.");
  }

  const host = process.env.NODE_ENV === 'production' 
    ? 'https://ic0.app' 
    : 'http://127.0.0.1:4943';

  const agent = new HttpAgent({ identity, host });

  if (process.env.NODE_ENV !== 'production') {
    await agent.fetchRootKey();
  }

  return Actor.createActor<_SERVICE>(idlFactory, { agent, canisterId });
};

// --- Data Conversion Helpers ---
const convertFromBackendAppointment = (backendApt: BackendAppointment): Appointment => ({
  id: Number(backendApt.id),
  title: backendApt.title,
  startTime: backendApt.startTime,
  endTime: backendApt.endTime,
  color: backendApt.color,
  category: backendApt.category,
  completed: backendApt.completed,
});

// --- Service Class ---
class CalendarService {
  async getAppointments(): Promise<{ [date: string]: Appointment[] }> {
    const actor = await getActor();
    const backendAppointments = await actor.getAppointments();
    
    const frontendAppointments: { [date: string]: Appointment[] } = {};
    backendAppointments.forEach(([date, apts]) => {
      frontendAppointments[date] = apts.map(convertFromBackendAppointment);
    });
    
    return frontendAppointments;
  }

  async createAppointment(date: string, appointment: Omit<Appointment, 'id' | 'completed'>): Promise<Appointment> {
    const actor = await getActor();
    const input: BackendAppointmentInput = {
      title: appointment.title,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      category: appointment.category,
      color: [appointment.color],
    };
    
    const result = await actor.createAppointment(date, input);
    if ('ok' in result) {
      return convertFromBackendAppointment(result.ok);
    }
    throw new Error(result.err);
  }

  async updateAppointment(date: string, id: number, updates: Partial<Appointment>): Promise<Appointment> {
    const actor = await getActor();
    const updateData: BackendAppointmentUpdate = {
      title: 'title' in updates ? [updates.title!] : [],
      startTime: 'startTime' in updates ? [updates.startTime!] : [],
      endTime: 'endTime' in updates ? [updates.endTime!] : [],
      category: 'category' in updates ? [updates.category!] : [],
      color: 'color' in updates ? [updates.color!] : [],
      completed: 'completed' in updates ? [updates.completed!] : [],
    };

    const result = await actor.updateAppointment(date, BigInt(id), updateData);
    if ('ok' in result) {
      return convertFromBackendAppointment(result.ok);
    }
    throw new Error(result.err);
  }

  async deleteAppointment(date: string, id: number): Promise<void> {
    const actor = await getActor();
    const result = await actor.deleteAppointment(date, BigInt(id));
    if ('err' in result) {
      throw new Error(result.err);
    }
  }
  
  async getCategories(): Promise<Category[]> {
      const actor = await getActor();
      return await actor.getCategories();
  }

  async createCategory(category: Omit<Category, 'textColor'> & {textColor?: string}): Promise<Category> {
    const actor = await getActor();
    const input: BackendCategoryInput = {
        name: category.name,
        color: category.color,
        textColor: category.textColor ? [category.textColor] : [],
    };
    const result = await actor.createCategory(input);
    if ('ok' in result) {
        return result.ok;
    }
    throw new Error(result.err);
  }
}

export const calendarService = new CalendarService();