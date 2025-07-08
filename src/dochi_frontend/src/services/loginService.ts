// loginService.ts - Fixed to match your existing backend
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";
import { createActor, canisterId } from '../../../declarations/login_backend';
import type { _SERVICE } from '../../../declarations/login_backend/login_backend.did';

// Types matching your existing backend exactly
export interface User {
  name: string;
  principal: string;
  createdAt: bigint;
}

export interface AuthResponse {
  user: User;
  isFirstTime: boolean;
}

export interface LoginResult {
  success: boolean;
  isFirstTime?: boolean;
  user?: User;
  error?: string;
}

export interface LoginStats {
  totalUsers: number;
  canisterMemory: number;
}

// Error types from your backend
type LoginError = 
  | { NotFound: null }
  | { AlreadyExists: null }
  | { NotAuthorized: null }
  | { InvalidInput: null };

// Result type from your backend
type Result<T, E> = { ok: T } | { err: E };

// Service configuration
interface LoginConfig {
  maxRetries: number;
  retryDelay: number;
  sessionTimeout: number;
  enableLogging: boolean;
}

class LoginService {
  private authClient: AuthClient | null = null;
  private actor: _SERVICE | null = null;
  private agent: HttpAgent | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;
  
  private config: LoginConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    sessionTimeout: 7 * 24 * 60 * 60 * 1000, // 7 days
    enableLogging: process.env.NODE_ENV === 'development'
  };

  private log(message: string, ...args: any[]) {
    if (this.config.enableLogging) {
      console.log(`[LoginService] ${message}`, ...args);
    }
  }

  private logError(message: string, error?: any) {
    console.error(`[LoginService] ${message}`, error);
  }

  // Helper to convert Candid optional to TypeScript optional
  private candidOptionalToUndefined<T>(candidOptional: [] | [T]): T | undefined {
    return candidOptional.length > 0 ? candidOptional[0] : undefined;
  }

  // Get Internet Identity provider URL with fallbacks
  private getIdentityProvider(): string {
    const isDevelopment = process.env.DFX_NETWORK === 'local' || 
                         process.env.NODE_ENV === 'development';
    
    if (!isDevelopment) {
      return "https://identity.ic0.app";
    }

    // Development environment - try multiple fallbacks
    const iiCanisterId = process.env.CANISTER_ID_INTERNET_IDENTITY || 'rdmx6-jaaaa-aaaaa-aaadq-cai';
    const host = window.location.hostname;
    const port = window.location.port || '4943';
    
    // Use query parameter format for better compatibility
    return `http://localhost:${port}/?canisterId=${iiCanisterId}`;
  }

  // Get agent host URL
  private getAgentHost(): string {
    const isDevelopment = process.env.DFX_NETWORK === 'local' || 
                         process.env.NODE_ENV === 'development';
    
    return isDevelopment ? 'http://localhost:4943' : 'https://ic0.app';
  }

  // Retry wrapper for network operations
  private async retry<T>(
    operation: () => Promise<T>, 
    operationName: string
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const result = await operation();
        if (attempt > 1) {
          this.log(`${operationName} succeeded on attempt ${attempt}`);
        }
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logError(`${operationName} failed on attempt ${attempt}:`, lastError);
        
        if (attempt < this.config.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempt));
        }
      }
    }
    
    throw new Error(`${operationName} failed after ${this.config.maxRetries} attempts: ${lastError?.message}`);
  }

  // Initialize the service
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initialize();
    return this.initPromise;
  }

  private async _initialize(): Promise<void> {
    try {
      this.log('Initializing login service...');

      // Skip WebAuthn check entirely - let Internet Identity handle it
      this.log('Skipping WebAuthn check - Internet Identity will handle compatibility');

      this.authClient = await this.retry(
        () => AuthClient.create({
          idleOptions: {
            disableIdle: true,
            disableDefaultIdleCallback: true
          }
        }),
        'AuthClient creation'
      );

      this.log('AuthClient created successfully');

      // Setup actor if already authenticated
      if (await this.authClient.isAuthenticated()) {
        await this.setupActor();
        this.log('Already authenticated, actor setup complete');
      }

      this.isInitialized = true;
      this.log('Login service initialized successfully');
    } catch (error) {
      this.initPromise = null;
      this.logError('Failed to initialize login service:', error);
      throw error;
    }
  }

  // Setup actor with authenticated identity
  private async setupActor(): Promise<void> {
    if (!this.authClient) {
      throw new Error('AuthClient not initialized');
    }

    try {
      const identity = this.authClient.getIdentity();
      const host = this.getAgentHost();
      
      this.log('Setting up actor with host:', host);

      this.agent = new HttpAgent({
        identity,
        host
      });

      // Fetch root key for local development
      if (process.env.DFX_NETWORK === 'local') {
        await this.agent.fetchRootKey();
        this.log('Root key fetched for local development');
      }

      this.actor = createActor(canisterId, {
        agent: this.agent
      });

      this.log('Actor setup complete');
    } catch (error) {
      this.logError('Failed to setup actor:', error);
      throw error;
    }
  }

  // Check authentication status
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.initialize();
      return this.authClient?.isAuthenticated() ?? false;
    } catch (error) {
      this.logError('Error checking authentication status:', error);
      return false;
    }
  }

  // Login with Internet Identity
  async login(): Promise<LoginResult> {
    try {
      await this.initialize();

      if (!this.authClient) {
        throw new Error('AuthClient not initialized');
      }

      // Internet Identity will handle all authentication methods

      const identityProvider = this.getIdentityProvider();
      this.log('Starting login with provider:', identityProvider);

      return new Promise((resolve) => {
        this.authClient!.login({
          identityProvider,
          maxTimeToLive: BigInt(this.config.sessionTimeout * 1_000_000), // Convert to nanoseconds
          onSuccess: async () => {
            try {
              this.log('Internet Identity login successful');
              await this.setupActor();
              
              // Try to login to backend using your existing method
              const result = await this.retry(
                () => this.actor!.loginUser(),
                'Backend login'
              );
              
              if ('ok' in result) {
                const { user, isFirstTime } = result.ok;
                this.log('Backend login successful', { isFirstTime });
                
                resolve({
                  success: true,
                  isFirstTime,
                  user
                });
              } else if ('err' in result && 'NotFound' in result.err) {
                this.log('First time user detected');
                resolve({
                  success: true,
                  isFirstTime: true
                });
              } else {
                const errorType = Object.keys(result.err)[0];
                this.logError('Backend login failed:', errorType);
                resolve({
                  success: false,
                  error: `Login failed: ${errorType}`
                });
              }
            } catch (error) {
              this.logError('Post-login setup failed:', error);
              resolve({
                success: false,
                error: error instanceof Error ? error.message : "Login setup failed"
              });
            }
          },
          onError: (error) => {
            this.logError('Internet Identity login failed:', error);
            
            let errorMessage = "Login failed";
            if (typeof error === 'string') {
              errorMessage = error;
            } else if (error && typeof error === 'object' && 'message' in error) {
              errorMessage = (error as any).message;
            }
            
            // Provide helpful error messages
            if (errorMessage.includes('credentials') || errorMessage.includes('WebAuthn')) {
              errorMessage = "WebAuthn authentication failed. Please try again or use a different browser.";
            }
            
            resolve({
              success: false,
              error: errorMessage
            });
          }
        });
      });
    } catch (error) {
      this.logError('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed"
      };
    }
  }

  // Create user profile using your existing backend method
  async createProfile(name: string): Promise<LoginResult> {
    try {
      if (!this.actor) {
        throw new Error("Not authenticated");
      }

      if (!name?.trim()) {
        return {
          success: false,
          error: "Name is required"
        };
      }

      this.log('Creating profile with name:', name.trim());

      const result = await this.retry(
        () => this.actor!.createUserProfile(name.trim()),
        'Create profile'
      );
      
      if ('ok' in result) {
        this.log('Profile created successfully');
        return {
          success: true,
          user: result.ok,
          isFirstTime: false
        };
      } else {
        const errorType = Object.keys(result.err)[0];
        let errorMessage = "Failed to create profile";
        
        switch (errorType) {
          case 'AlreadyExists':
            errorMessage = "Profile already exists";
            break;
          case 'InvalidInput':
            errorMessage = "Invalid name provided. Name must be 1-50 characters.";
            break;
          case 'NotAuthorized':
            errorMessage = "Not authorized to create profile";
            break;
          default:
            errorMessage = `Failed to create profile: ${errorType}`;
        }
        
        this.logError('Profile creation failed:', errorType);
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (error) {
      this.logError('Create profile error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create profile"
      };
    }
  }

  // Check if user exists (add this method if you need it)
  async checkUserExists(): Promise<User | null> {
    try {
      if (!this.actor) {
        return null;
      }

      const userResult = await this.retry(
        () => this.actor!.checkUserExists(),
        'Check user exists'
      );
      
      // Your backend returns Candid optional: [] | [User]
      const user = this.candidOptionalToUndefined(userResult);
      return user || null;
    } catch (error) {
      this.logError('Check user exists error:', error);
      return null;
    }
  }

  // Get current user using your existing backend method
  async getCurrentUser(): Promise<User | null> {
    try {
      if (!this.actor) {
        return null;
      }

      const userResult = await this.retry(
        () => this.actor!.getMyProfile(),
        'Get current user'
      );
      
      // Your backend returns Candid optional: [] | [User]
      const user = this.candidOptionalToUndefined(userResult);
      return user || null;
    } catch (error) {
      this.logError('Get current user error:', error);
      return null;
    }
  }

  // Update profile using your existing backend method
  async updateProfile(name: string): Promise<LoginResult> {
    try {
      if (!this.actor) {
        throw new Error("Not authenticated");
      }

      if (!name?.trim()) {
        return {
          success: false,
          error: "Name is required"
        };
      }

      const result = await this.retry(
        () => this.actor!.updateUserProfile(name.trim()),
        'Update profile'
      );
      
      if ('ok' in result) {
        return {
          success: true,
          user: result.ok
        };
      } else {
        const errorType = Object.keys(result.err)[0];
        return {
          success: false,
          error: `Failed to update profile: ${errorType}`
        };
      }
    } catch (error) {
      this.logError('Update profile error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update profile"
      };
    }
  }

  // Get login statistics using your existing backend method
  async getLoginStats(): Promise<LoginStats | null> {
    try {
      if (!this.actor) {
        return null;
      }

      const stats = await this.retry(
        () => this.actor!.getLoginStats(),
        'Get login stats'
      );
      
      // Your backend returns { totalUsers: Nat; canisterMemory: Nat; }
      return {
        totalUsers: Number(stats.totalUsers),
        canisterMemory: Number(stats.canisterMemory)
      };
    } catch (error) {
      this.logError('Get login stats error:', error);
      return null;
    }
  }

  // Get user profile by principal (if you need this method)
  async getUserProfile(principal: string): Promise<User | null> {
    try {
      if (!this.actor) {
        return null;
      }

      // Convert string principal to Principal type if needed
      const userResult = await this.retry(
        () => this.actor!.getUserProfile(principal as any), // Type assertion for Principal
        'Get user profile'
      );
      
      // Your backend returns Candid optional: [] | [User]
      const user = this.candidOptionalToUndefined(userResult);
      return user || null;
    } catch (error) {
      this.logError('Get user profile error:', error);
      return null;
    }
  }

  // Delete profile using your existing backend method
  async deleteProfile(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.actor) {
        throw new Error("Not authenticated");
      }

      const result = await this.retry(
        () => this.actor!.deleteUserProfile(),
        'Delete profile'
      );
      
      if ('ok' in result) {
        return {
          success: true
        };
      } else {
        const errorType = Object.keys(result.err)[0];
        return {
          success: false,
          error: `Failed to delete profile: ${errorType}`
        };
      }
    } catch (error) {
      this.logError('Delete profile error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete profile"
      };
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      this.log('Logging out...');
      
      if (this.authClient) {
        await this.authClient.logout();
      }
      
      this.actor = null;
      this.agent = null;
      this.isInitialized = false;
      this.initPromise = null;
      
      this.log('Logout complete');
    } catch (error) {
      this.logError('Logout error:', error);
      // Don't throw - always allow logout to complete
    }
  }

  // Get principal
  getPrincipal(): string {
    try {
      return this.authClient?.getIdentity()?.getPrincipal()?.toString() || "";
    } catch (error) {
      this.logError('Get principal error:', error);
      return "";
    }
  }

  // Health check using your existing backend method
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.actor) {
        return false;
      }

      await this.actor.healthCheck();
      return true;
    } catch (error) {
      this.logError('Health check failed:', error);
      return false;
    }
  }

  // Force re-initialization (useful for debugging)
  async reinitialize(): Promise<void> {
    this.isInitialized = false;
    this.initPromise = null;
    this.actor = null;
    this.agent = null;
    this.authClient = null;
    
    await this.initialize();
  }
}

// Export singleton instance
export const loginService = new LoginService();