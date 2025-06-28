// dochi_frontend/src/services/calendarService.ts
import { Actor, ActorSubclass, HttpAgent, Identity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

// CORRECTED: Use the '@declarations' alias, not the relative path.
import { idlFactory } from '../../../src/declarations/calendar_backend';
import type { _SERVICE, Appointment as BackendAppointment, Category as BackendCategory } from '../../../src/declarations/calendar_backend/calendar_backend.did';

// Frontend types to match your calendar.tsx component
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

const getActor = async (): Promise<ActorSubclass<_SERVICE>> => {
  const authClient = await AuthClient.create();
  
  let identity: Identity;
  if (await authClient.isAuthenticated()) {
    identity = authClient.getIdentity();
  }
  
  const canisterId = import.meta.env.VITE_CALENDAR_CANISTER_ID as string;
  
  // Use the window's origin to connect through the Vite proxy
  const host = process.env.DFX_NETWORK === 'ic' ? 'https://icp-api.io' : window.location.origin;
  
  const agent = new HttpAgent({
    identity,
    host,
  });

  if (process.env.DFX_NETWORK !== 'ic') {
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

const formatAppointment = (apt: BackendAppointment): Appointment => ({
    ...apt,
    id: Number(apt.id),
});

export const calendarService = {
  getInitialData: async (): Promise<{ appointments: { [date: string]: Appointment[] }, categories: Category[] }> => {
    const actor = await getActor();
    const principal = (await AuthClient.create()).getIdentity().getPrincipal();
    
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

  createAppointment: async (appointmentData: any): Promise<Appointment> => {
    const actor = await getActor();
    const principal = (await AuthClient.create()).getIdentity().getPrincipal();
    const result = await actor.createAppointment(principal, appointmentData);
    
    if ('ok' in result) {
      return formatAppointment(result.ok);
    } else {
      throw new Error(result.err);
    }
  },
};