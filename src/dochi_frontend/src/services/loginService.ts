// loginService.ts
import { AuthClient } from "@dfinity/auth-client";
import { createActor, canisterId as declaredCanisterId } from '../../../declarations/login_backend';
import { canisterId as declaredIICanisterId } from '../../../declarations/internet_identity';

// Backend User type with BigInt
interface BackendUser {
  name: string;
  principal: string;
  createdAt: bigint;
}

// Frontend User type with number for display
export interface User {
  name: string;
  principal: string;
  createdAt: bigint; // Keep as bigint, convert in display logic
}

// Convert backend user to frontend user
const convertUser = (backendUser: BackendUser): User => ({
  name: backendUser.name,
  principal: backendUser.principal,
  createdAt: backendUser.createdAt // Keep as bigint
});

type LoginError = 
  | { NotFound: null }
  | { AlreadyExists: null }
  | { NotAuthorized: null }
  | { InvalidInput: null };

interface AuthResponse {
  user: BackendUser;
  isFirstTime: boolean;
}

type Result<T, E> = { ok: T } | { err: E };

// Backend actor interface (matches your Motoko canister)
interface LoginActor {
  checkUserExists(): Promise<BackendUser | undefined>;
  createUserProfile(name: string): Promise<Result<BackendUser, LoginError>>;
  loginUser(): Promise<Result<AuthResponse, LoginError>>;
  updateUserProfile(name: string): Promise<Result<BackendUser, LoginError>>;
  getMyProfile(): Promise<BackendUser | undefined>;
  deleteUserProfile(): Promise<Result<boolean, LoginError>>;
}

class LoginService {
  private authClient: AuthClient | null = null;
  private actor: LoginActor | null = null;
  
  private getIdentityProvider(): string {
    const iiCanisterId = declaredIICanisterId || process.env.CANISTER_ID_INTERNET_IDENTITY;
    return process.env.DFX_NETWORK === 'ic'
      ? "https://identity.ic0.app"
      : `http://${iiCanisterId}.localhost:4943`;
  }

  async initialize(): Promise<void> {
    try {
      this.authClient = await AuthClient.create({
        idleOptions: {
          disableIdle: true,
          disableDefaultIdleCallback: true
        }
      });

      if (await this.authClient.isAuthenticated()) {
        await this.setupActorWithAuth();
      }
    } catch (error) {
      console.error("Failed to initialize auth client:", error);
      throw error;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    if (!this.authClient) {
      await this.initialize();
    }
    return this.authClient?.isAuthenticated() ?? false;
  }

  async login(): Promise<{ success: boolean; isFirstTime?: boolean; user?: User; error?: string }> {
    try {
      if (!this.authClient) {
        await this.initialize();
      }

      if (!this.authClient) {
        throw new Error("Failed to initialize auth client");
      }

      return new Promise((resolve) => {
        this.authClient!.login({
          identityProvider: this.getIdentityProvider(),
          maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days in nanoseconds
          onSuccess: async () => {
            try {
              await this.setupActorWithAuth();
              
              // Check if user exists in backend
              const result = await this.actor!.loginUser();
              
              if ('ok' in result) {
                // User exists, return their data
                resolve({
                  success: true,
                  isFirstTime: result.ok.isFirstTime,
                  user: convertUser(result.ok.user)
                });
              } else if ('err' in result && 'NotFound' in result.err) {
                // First time user
                resolve({
                  success: true,
                  isFirstTime: true
                });
              } else {
                resolve({
                  success: false,
                  error: "Login failed"
                });
              }
            } catch (error) {
              console.error("Post-login setup failed:", error);
              resolve({
                success: false,
                error: error instanceof Error ? error.message : "Login failed"
              });
            }
          },
          onError: (error) => {
            console.error("Internet Identity login failed:", error);
            resolve({
              success: false,
              error: typeof error === 'string' ? error : "Login failed"
            });
          }
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed"
      };
    }
  }

  async createProfile(name: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      if (!this.actor) {
        throw new Error("Not authenticated");
      }

      const result = await this.actor.createUserProfile(name);
      
      if ('ok' in result) {
        return {
          success: true,
          user: convertUser(result.ok)
        };
      } else {
        let errorMessage = "Failed to create profile";
        if ('err' in result) {
          if ('AlreadyExists' in result.err) {
            errorMessage = "Profile already exists";
          } else if ('InvalidInput' in result.err) {
            errorMessage = "Invalid name provided";
          }
        }
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (error) {
      console.error("Create profile error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create profile"
      };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      if (!this.actor) {
        return null;
      }

      const user = await this.actor.getMyProfile();
      return user ? convertUser(user) : null;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.authClient) {
        await this.authClient.logout();
      }
      this.actor = null;
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  getPrincipal(): string {
    return this.authClient?.getIdentity()?.getPrincipal()?.toString() || "";
  }

  private async setupActorWithAuth(): Promise<void> {
    if (!this.authClient) {
      throw new Error("Auth client not initialized");
    }

    const identity = this.authClient.getIdentity();
    
    // Get canister ID with fallback
    const canisterId = declaredCanisterId || process.env.CANISTER_ID_LOGIN_BACKEND;
    
    if (!canisterId) {
      throw new Error('Login backend canister ID not found. Make sure the canister is deployed.');
    }
    
    // Create the actor with the authenticated identity
    this.actor = createActor(canisterId, {
      agentOptions: {
        identity,
        host: process.env.DFX_NETWORK === 'ic' ? 'https://ic0.app' : 'http://localhost:4943'
      }
    });
  }
}

// Export singleton instance
export const loginService = new LoginService();