// profileService.ts - Comprehensive service to fetch all user data for profile display
import { loginService, User } from './loginService';
import { calendarService } from './calendarService';
import { getAllFocusData } from './focusServices';

export interface UserProfileData {
  // User basic info
  user: User | null;
  
  // Calendar stats
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  categories: number;
  
  // Focus stats  
  totalFocusTime: number; // Total minutes across all sessions
  focusSessionsCount: number; // Number of focus sessions
  averageFocusTime: number; // Average session length
  bestFocusDay: { date: string; minutes: number } | null;
  
  // General stats
  memberSince: string; // Formatted date
  isLoading: boolean;
  error: string | null;
}

class ProfileService {
  async getUserProfileData(): Promise<UserProfileData> {
    try {
      // Initialize default data
      const profileData: UserProfileData = {
        user: null,
        totalAppointments: 0,
        upcomingAppointments: 0,
        completedAppointments: 0,
        categories: 0,
        totalFocusTime: 0,
        focusSessionsCount: 0,
        averageFocusTime: 0,
        bestFocusDay: null,
        memberSince: '',
        isLoading: true,
        error: null
      };

      // Check if user is authenticated
      const isAuthenticated = await loginService.isAuthenticated();
      if (!isAuthenticated) {
        throw new Error('User not authenticated');
      }

      // Fetch user basic info
      const user = await loginService.getCurrentUser();
      if (!user) {
        throw new Error('Failed to get user profile');
      }
      
      profileData.user = user;
      profileData.memberSince = new Date(Number(user.createdAt)).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      });

      // Fetch calendar data
      try {
        const { appointments, categories } = await calendarService.getInitialData();
        
        profileData.categories = categories.length;
        
        // Process appointments
        const allAppointments = Object.values(appointments).flat();
        profileData.totalAppointments = allAppointments.length;
        profileData.completedAppointments = allAppointments.filter(apt => apt.completed).length;
        
        // Count upcoming appointments (today and future)
        const today = new Date().toISOString().split('T')[0];
        profileData.upcomingAppointments = allAppointments.filter(apt => 
          apt.date >= today && !apt.completed
        ).length;
        
      } catch (error) {
        console.warn('Failed to fetch calendar data:', error);
        // Continue without calendar data
      }

      // Fetch focus data
      try {
        const focusData = await getAllFocusData();
        const focusValues = Object.values(focusData);
        const focusEntries = Object.entries(focusData);
        
        profileData.totalFocusTime = focusValues.reduce((sum, minutes) => sum + minutes, 0);
        profileData.focusSessionsCount = focusValues.filter(minutes => minutes > 0).length;
        profileData.averageFocusTime = profileData.focusSessionsCount > 0 
          ? Math.round(profileData.totalFocusTime / profileData.focusSessionsCount)
          : 0;
        
        // Find best focus day
        if (focusEntries.length > 0) {
          const bestDay = focusEntries.reduce((best, [date, minutes]) => 
            minutes > best.minutes ? { date, minutes } : best,
            { date: '', minutes: 0 }
          );
          profileData.bestFocusDay = bestDay.minutes > 0 ? bestDay : null;
        }
        
      } catch (error) {
        console.warn('Failed to fetch focus data:', error);
        // Continue without focus data
      }

      profileData.isLoading = false;
      return profileData;
      
    } catch (error) {
      console.error('Error fetching profile data:', error);
      return {
        user: null,
        totalAppointments: 0,
        upcomingAppointments: 0,
        completedAppointments: 0,
        categories: 0,
        totalFocusTime: 0,
        focusSessionsCount: 0,
        averageFocusTime: 0,
        bestFocusDay: null,
        memberSince: '',
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load profile data'
      };
    }
  }

  // Helper method to get just username for header/navbar
  async getUsername(): Promise<string | null> {
    try {
      const user = await loginService.getCurrentUser();
      return user?.name || null;
    } catch (error) {
      console.error('Error getting username:', error);
      return null;
    }
  }

  // Helper method to format focus time nicely
  formatFocusTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
}

export const profileService = new ProfileService();