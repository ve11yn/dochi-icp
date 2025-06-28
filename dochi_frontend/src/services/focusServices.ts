import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../../../src/declarations/focus_backend';
import { _SERVICE } from '../../../src/declarations/focus_backend/focus_backend.did';

// Create agent
const agent = new HttpAgent({
  host: process.env.NODE_ENV === 'production' 
    ? 'https://ic0.app' 
    : 'http://127.0.0.1:4943'
});

// For local development, fetch root key
if (process.env.NODE_ENV !== 'production') {
  agent.fetchRootKey().catch(console.error);
}

// Get canister ID
const canisterId = process.env.REACT_APP_BACKEND_CANISTER_ID || 
  process.env.CANISTER_ID_BACKEND || 
  'rrkah-fqaaa-aaaaa-aaaaq-cai'; // Default local canister ID

// Create actor
const backend = Actor.createActor<_SERVICE>(idlFactory, {
  agent,
  canisterId,
});

// Helper to get today's date
export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Add focus time to IC
export const addFocusTime = async (date: string, duration: number): Promise<boolean> => {
  try {
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