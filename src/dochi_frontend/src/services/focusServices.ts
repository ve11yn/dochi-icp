import { Actor, ActorSubclass, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { idlFactory, canisterId as declaredCanisterId } from '../../../declarations/focus_backend';
import { _SERVICE } from '../../../declarations/focus_backend/focus_backend.did';

// Helper to get today's date
export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

const getActor = async (): Promise<ActorSubclass<_SERVICE>> => {
  const authClient = await AuthClient.create();

  if (!(await authClient.isAuthenticated())) {
    throw new Error("User not authenticated");
  }

  const identity = authClient.getIdentity();
  
  // Get canister ID with fallback
  const canisterId = declaredCanisterId || process.env.CANISTER_ID_FOCUS_BACKEND;
  
  if (!canisterId) {
    throw new Error("Focus backend canister ID not found. Make sure the canister is deployed.");
  }

  const host = process.env.NODE_ENV === 'production' 
    ? 'https://ic0.app' 
    : 'http://127.0.0.1:4943';

  const agent = new HttpAgent({
    identity,
    host,
  });

  if (process.env.NODE_ENV !== 'production') {
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

// Add focus time to IC
export const addFocusTime = async (date: string, duration: number): Promise<boolean> => {
  try {
    const backend = await getActor();
    const result = await backend.addFocusTime(date, BigInt(duration));
    console.log('Focus time saved to IC:', result);
    return result;
  } catch (error) {
    console.error('Error saving to IC:', error);
    return false;
  }
};

// Get focus time for a date from IC
export const getFocusTime = async (date: string): Promise<number> => {
  try {
    const backend = await getActor();
    const result = await backend.getFocusTime(date);
    return Number(result);
  } catch (error) {
    console.error('Error getting focus time from IC:', error);
    return 0;
  }
};

// Get all focus data from IC
export const getAllFocusData = async (): Promise<Record<string, number>> => {
  try {
    const backend = await getActor();
    const result = await backend.getAllFocusData();
    const data: Record<string, number> = {};
    result.forEach(([date, duration]) => {
      data[date] = Number(duration);
    });
    return data;
  } catch (error) {
    console.error('Error getting all focus data from IC:', error);
    return {};
  }
};