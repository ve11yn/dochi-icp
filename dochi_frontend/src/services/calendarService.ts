// services/calendarService.ts
import { Actor, HttpAgent, Identity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

// Type definitions matching your frontend
export interface Appointment {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  color: string;
  category: string;
  completed: boolean;
  date?: string;
  userId?: Principal;
  createdAt?: bigint;
  updatedAt?: bigint;
}

export interface Category {
  name: string;
  color: string;
  textColor: string;
}

export interface CreateAppointmentRequest {
  title: string;
  startTime: string;
  endTime: string;
  category: string;
  date: string;
}

export interface UpdateAppointmentRequest {
  id: number;
  title?: string;
  startTime?: string;
  endTime?: string;
  category?: string;
  completed?: boolean;
}

// IDL Factory (generated from candid file - simplified version)
const idlFactory = ({ IDL }) => {
  const Category = IDL.Record({
    name: IDL.Text,
    color: IDL.Text,
    textColor: IDL.Text,
  });

  const Appointment = IDL.Record({
    id: IDL.Nat,
    title: IDL.Text,
    startTime: IDL.Text,
    endTime: IDL.Text,
    color: IDL.Text,
    category: IDL.Text,
    completed: IDL.Bool,
    date: IDL.Text,
    userId: IDL.Principal,
    createdAt: IDL.Int,
    updatedAt: IDL.Int,
  });

  const CreateAppointmentRequest = IDL.Record({
    title: IDL.Text,
    startTime: IDL.Text,
    endTime: IDL.Text,
    category: IDL.Text,
    date: IDL.Text,
  });

  const UpdateAppointmentRequest = IDL.Record({
    id: IDL.Nat,
    title: IDL.Opt(IDL.Text),
    startTime: IDL.Opt(IDL.Text),
    endTime: IDL.Opt(IDL.Text),
    category: IDL.Opt(IDL.Text),
    completed: IDL.Opt(IDL.Bool),
  });

  const UserProfile = IDL.Record({
    userId: IDL.Principal,
    categories: IDL.Vec(Category),
    createdAt: IDL.Int,
  });

  const Result_1 = IDL.Variant({
    ok: IDL.Text,
    err: IDL.Text,
  });

  const Result_2 = IDL.Variant({
    ok: Appointment,
    err: IDL.Text,
  });

  return IDL.Service({
    getUserProfile: IDL.Func([IDL.Principal], [UserProfile], ['query']),
    addCategory: IDL.Func([IDL.Principal, Category], [Result_1], []),
    deleteCategory: IDL.Func([IDL.Principal, IDL.Text], [Result_1], []),
    createAppointment: IDL.Func([IDL.Principal, CreateAppointmentRequest], [Result_2], []),
    updateAppointment: IDL.Func([IDL.Principal, UpdateAppointmentRequest], [Result_2], []),
    deleteAppointment: IDL.Func([IDL.Principal, IDL.Nat], [Result_1], []),
    getAppointmentsByDateRange: IDL.Func([IDL.Principal, IDL.Text, IDL.Text], [IDL.Vec(Appointment)], ['query']),
    getAppointmentsByDate: IDL.Func([IDL.Principal, IDL.Text], [IDL.Vec(Appointment)], ['query']),
    getAllAppointments: IDL.Func([IDL.Principal], [IDL.Vec(Appointment)], ['query']),
    toggleAppointmentCompletion: IDL.Func([IDL.Principal, IDL.Nat], [Result_2], []),
    getAppointmentsGroupedByDate: IDL.Func([IDL.Principal], [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(Appointment)))], ['query']),
  });
};

class CalendarService {
  private actor: any;
  private identity: Identity | null = null;
  private principal: Principal | null = null;
  private authClient: AuthClient | null = null;

  constructor() {
    this.initializeActor();
  }

  private async initializeActor() {
    // Initialize auth client
    this.authClient = await AuthClient.create();
    
    // Check if user is authenticated
    if (await this.authClient.isAuthenticated()) {
      this.identity = this.authClient.getIdentity();
      this.principal = this.identity.getPrincipal();
    }

    // Create agent
    const agent = new HttpAgent({
      identity: this.identity,
      host: process.env.REACT_APP_IC_HOST || 'http://localhost:8000',
    });

    // In development, fetch root key
    if (process.env.NODE_ENV === 'development') {
      await agent.fetchRootKey();
    }

    // Create actor
    this.actor = Actor.createActor(idlFactory, {
      agent,
      canisterId: process.env.REACT_APP_CALENDAR_CANISTER_ID || 'your-canister-id',
    });
  }

  async login(): Promise<Principal> {
    if (!this.authClient) {
      this.authClient = await AuthClient.create();
    }

    return new Promise((resolve, reject) => {
      this.authClient!.login({
        identityProvider: process.env.REACT_APP_IDENTITY_PROVIDER,
        onSuccess: async () => {
          this.identity = this.authClient!.getIdentity();
          this.principal = this.identity.getPrincipal();
          await this.initializeActor();
          resolve(this.principal!);
        },
        onError: reject,
      });
    });
  }

  async logout() {
    if (this.authClient) {
      await this.authClient.logout();
      this.identity = null;
      this.principal = null;
      await this.initializeActor();
    }
  }

  isAuthenticated(): boolean {
    return this.principal !== null;
  }

  getPrincipal(): Principal | null {
    return this.principal;
  }

  // Category Management
  async getUserProfile() {
    if (!this.principal) throw new Error('Not authenticated');
    return await this.actor.getUserProfile(this.principal);
  }

  async addCategory(category: Category): Promise<{ ok?: string; err?: string }> {
    if (!this.principal) throw new Error('Not authenticated');
    return await this.actor.addCategory(this.principal, category);
  }

  async deleteCategory(categoryName: string): Promise<{ ok?: string; err?: string }> {
    if (!this.principal) throw new Error('Not authenticated');
    return await this.actor.deleteCategory(this.principal, categoryName);
  }

  // Appointment Management
  async createAppointment(request: CreateAppointmentRequest): Promise<{ ok?: Appointment; err?: string }> {
    if (!this.principal) throw new Error('Not authenticated');
    const result = await this.actor.createAppointment(this.principal, request);
    
    // Convert bigint to number for frontend compatibility
    if (result.ok) {
      result.ok.id = Number(result.ok.id);
      result.ok.createdAt = Number(result.ok.createdAt);
      result.ok.updatedAt = Number(result.ok.updatedAt);
    }
    
    return result;
  }

  async updateAppointment(request: UpdateAppointmentRequest): Promise<{ ok?: Appointment; err?: string }> {
    if (!this.principal) throw new Error('Not authenticated');
    const result = await this.actor.updateAppointment(this.principal, {
      ...request,
      title: request.title ? [request.title] : [],
      startTime: request.startTime ? [request.startTime] : [],
      endTime: request.endTime ? [request.endTime] : [],
      category: request.category ? [request.category] : [],
      completed: request.completed !== undefined ? [request.completed] : [],
    });

    if (result.ok) {
      result.ok.id = Number(result.ok.id);
      result.ok.createdAt = Number(result.ok.createdAt);
      result.ok.updatedAt = Number(result.ok.updatedAt);
    }

    return result;
  }

  async deleteAppointment(appointmentId: number): Promise<{ ok?: string; err?: string }> {
    if (!this.principal) throw new Error('Not authenticated');
    return await this.actor.deleteAppointment(this.principal, appointmentId);
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    if (!this.principal) throw new Error('Not authenticated');
    const appointments = await this.actor.getAppointmentsByDate(this.principal, date);
    
    // Convert bigints to numbers
    return appointments.map(apt => ({
      ...apt,
      id: Number(apt.id),
      createdAt: Number(apt.createdAt),
      updatedAt: Number(apt.updatedAt),
    }));
  }

  async getAppointmentsByDateRange(startDate: string, endDate: string): Promise<Appointment[]> {
    if (!this.principal) throw new Error('Not authenticated');
    const appointments = await this.actor.getAppointmentsByDateRange(this.principal, startDate, endDate);
    
    return appointments.map(apt => ({
      ...apt,
      id: Number(apt.id),
      createdAt: Number(apt.createdAt),
      updatedAt: Number(apt.updatedAt),
    }));
  }

  async getAllAppointments(): Promise<Appointment[]> {
    if (!this.principal) throw new Error('Not authenticated');
    const appointments = await this.actor.getAllAppointments(this.principal);
    
    return appointments.map(apt => ({
      ...apt,
      id: Number(apt.id),
      createdAt: Number(apt.createdAt),
      updatedAt: Number(apt.updatedAt),
    }));
  }

  async toggleAppointmentCompletion(appointmentId: number): Promise<{ ok?: Appointment; err?: string }> {
    if (!this.principal) throw new Error('Not authenticated');
    const result = await this.actor.toggleAppointmentCompletion(this.principal, appointmentId);
    
    if (result.ok) {
      result.ok.id = Number(result.ok.id);
      result.ok.createdAt = Number(result.ok.createdAt);
      result.ok.updatedAt = Number(result.ok.updatedAt);
    }
    
    return result;
  }

  async getAppointmentsGroupedByDate(): Promise<{ [date: string]: Appointment[] }> {
    if (!this.principal) throw new Error('Not authenticated');
    const grouped = await this.actor.getAppointmentsGroupedByDate(this.principal);
    
    // Convert array format to object format
    const result: { [date: string]: Appointment[] } = {};
    for (const [date, appointments] of grouped) {
      result[date] = appointments.map(apt => ({
        ...apt,
        id: Number(apt.id),
        createdAt: Number(apt.createdAt),
        updatedAt: Number(apt.updatedAt),
      }));
    }
    
    return result;
  }
}

// Export singleton instance
export const calendarService = new CalendarService();