// loginService.ts
import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent, ActorSubclass } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
// Corrected import: Alias idlFactory for clarity and to avoid type conflicts
import { idlFactory } from '../../../src/declarations/login_backend';
import type { User, LoginError, _SERVICE } from '../../../src/declarations/login_backend/login_backend.did';

export interface AuthResponse {
  user: User;
  isFirstTime: boolean;
}

export class LoginService {
  private authClient: AuthClient | null = null;
  // Fixed: Use ActorSubclass instead of Actor<_SERVICE>
  private backendActor: ActorSubclass<_SERVICE> | null = null;

  // Initialize the service
  async initialize(): Promise<void> {
    try {
      this.authClient = await AuthClient.create();

      if (await this.authClient.isAuthenticated()) {
        await this.setupBackendActor();
      }
    } catch (error) {
      console.error("Failed to initialize login service:", error);
      throw error; // Re-throw to propagate initialization errors
    }
  }

  // Setup backend actor with authenticated identity
  private async setupBackendActor(): Promise<void> {
    if (!this.authClient) {
      throw new Error("Auth client not initialized");
    }

    const isLocal = import.meta.env.DFX_NETWORK === "local";
    const host = isLocal ? "http://127.0.0.1:4943" : "https://ic0.app";

    const agent = new HttpAgent({
      identity: this.authClient.getIdentity(),
      host,
    });

    // MUST fetch root key for local development
    if (isLocal) {
      console.log("Fetching root key for local development...");
      try {
        await agent.fetchRootKey();
        console.log("Root key fetched successfully");
      } catch (err) {
        console.error("Root key fetch failed:", err);
        throw new Error("Failed to initialize local development environment");
      }
    }

    const canisterId = import.meta.env.VITE_LOGIN_CANISTER_ID;
    if (!canisterId) {
      throw new Error("Login canister ID not configured");
    }

    this.backendActor = Actor.createActor(idlFactory, {
      // Use the imported idlFactory
      agent,
      canisterId,
    }) as ActorSubclass<_SERVICE>;
  }

  // Login method
  async login(): Promise<{
    success: boolean;
    isFirstTime: boolean;
    user?: User;
    error?: string;
  }> {
    try {
      if (!this.authClient) {
        await this.initialize();
      }

      const isLocal = import.meta.env.DFX_NETWORK === "local";
      const identityProviderUrl = isLocal
        ? `http://localhost:4943?canisterId=${
            import.meta.env.VITE_INTERNET_IDENTITY_CANISTER_ID
          }`
        : "https://identity.ic0.app";

      return new Promise((resolve) => {
        this.authClient!.login({
          identityProvider: identityProviderUrl,
          maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days
          derivationOrigin: isLocal ? undefined : window.location.origin,
          onSuccess: async () => {
            try {
              await this.setupBackendActor();
              const result = await this.checkExistingUser();
              resolve(result);
            } catch (error) {
              console.error("Post-login setup failed:", error);
              resolve({
                success: false,
                isFirstTime: false,
                error: "Authentication failed. Please try again.",
              });
            }
          },
          onError: (error) => {
            console.error("Login failed:", error);
            resolve({
              success: false,
              isFirstTime: false,
              error: `Login failed: ${error}`,
            });
          },
        });
      });
    } catch (error) {
      console.error("Login process error:", error);
      return {
        success: false,
        isFirstTime: false,
        error: "Login service unavailable",
      };
    }
  }

  // Check if user exists after login - UPDATED WITH DEBUGGING
  private async checkExistingUser(): Promise<{
    success: boolean;
    isFirstTime: boolean;
    user?: User;
    error?: string;
  }> {
    try {
      if (!this.backendActor) {
        console.error("Backend actor not initialized");
        throw new Error(
          "Backend actor not initialized during user check. Cannot proceed."
        );
      }

      // Debug: Log the principal being used
      const principal = this.authClient
        ?.getIdentity()
        .getPrincipal()
        .toString();
      console.log("Checking user with principal:", principal);
      console.log(
        "Backend canister ID:",
        import.meta.env.VITE_LOGIN_CANISTER_ID
      );

      // Call the backend
      const existingUserOpt = await this.backendActor.checkUserExists();
      console.log("Backend response:", existingUserOpt);

      if (existingUserOpt.length > 0) {
        // User exists
        console.log("User found:", existingUserOpt[0]);
        // Convert bigint to number for frontend compatibility
        const user = {
          ...existingUserOpt[0],
          createdAt: Number(existingUserOpt[0].createdAt),
        };
        return {
          success: true,
          isFirstTime: false,
          user: user as User,
        };
      } else {
        // New user
        console.log("New user - first time login");
        return {
          success: true,
          isFirstTime: true,
        };
      }
    } catch (error) {
      console.error("Error checking user existence:", error);
      console.error("Error details:", {
        hasBackendActor: !!this.backendActor,
        hasAuthClient: !!this.authClient,
        identity: this.authClient?.getIdentity().getPrincipal().toString(),
        canisterId: import.meta.env.VITE_LOGIN_CANISTER_ID,
      });

      // For now, treat errors as first-time user to allow profile creation
      return {
        success: true,
        isFirstTime: true,
        error: "Treating as new user due to backend error",
      };
    }
  }

  // Create user profile (first time)
  // ... (keep all other methods the same, just modify the createProfile method)

  async createProfile(
    name: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      console.log("createProfile called with name:", name);

      if (!this.backendActor) {
        console.error("Backend actor not initialized in createProfile");
        throw new Error(
          "Backend actor not initialized. Please try logging in again."
        );
      }

      if (!this.authClient) {
        console.error("Auth client not initialized in createProfile");
        throw new Error(
          "Authentication client not initialized. Please try logging in again."
        );
      }

      const principal = this.authClient.getIdentity().getPrincipal().toString();
      console.log("Creating profile for principal:", principal);
      console.log(
        "Using backend canister ID:",
        import.meta.env.VITE_LOGIN_CANISTER_ID
      );

      // Call the correct backend method
      const result = await this.backendActor.createUserProfile(name);
      console.log("Backend createUserProfile result:", result);

      // Properly handle the Result type
      if ("ok" in result) {
        // Profile created successfully
        const user = {
          ...result.ok,
          createdAt: Number(result.ok.createdAt),
        };

        console.log("Profile created successfully:", user);
        return {
          success: true,
          user: user as User,
        };
      } else {
        // Handle backend error
        const errorMsg = this.getErrorMessage(result.err);
        console.error("Backend error creating profile:", errorMsg);
        return {
          success: false,
          error: errorMsg,
        };
      }
    } catch (error) {
      console.error("Error in createProfile:", error);

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `Failed to create profile: ${errorMessage}`,
      };
    }
  }

  // Update user profile
  async updateProfile(
    name: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      if (!this.backendActor) {
        throw new Error(
          "Backend actor not initialized for profile update. Cannot proceed."
        );
      }

      const result = await this.backendActor.updateUserProfile(name);

      if ("ok" in result) {
        // Convert bigint to number
        const user = {
          ...result.ok,
          createdAt: Number(result.ok.createdAt),
        };
        return {
          success: true,
          user: user as User,
        };
      } else {
        return {
          success: false,
          error: this.getErrorMessage(result.err),
        };
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, error: "Failed to update profile" };
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      if (this.authClient) {
        await this.authClient.logout();
        this.backendActor = null; // Clear backend actor state after logout
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  // Get current authentication status
  async isAuthenticated(): Promise<boolean> {
    try {
      if (!this.authClient) {
        this.authClient = await AuthClient.create(); // Create if not already created
      }
      const authenticated = await this.authClient!.isAuthenticated();

      // If authenticated but backendActor isn't set up yet, set it up
      if (authenticated && !this.backendActor) {
        await this.setupBackendActor();
      }
      return authenticated;
    } catch (error) {
      console.error("Error checking authentication status:", error);
      return false;
    }
  }

  // Get current user profile
  async getCurrentUser(): Promise<User | null> {
    try {
      // Ensure authentication and actor setup before fetching user profile
      const authenticated = await this.isAuthenticated();
      if (!authenticated || !this.backendActor) {
        return null;
      }

      // Motoko's `Opt<User>` is translated to `User[]`
      const userOpt = await this.backendActor.getMyProfile();
      if (userOpt.length > 0) {
        // Convert bigint to number
        const user = {
          ...userOpt[0],
          createdAt: Number(userOpt[0].createdAt),
        };
        return user as User;
      }
      return null;
    } catch (error) {
      console.error("Error getting current user profile:", error);
      return null;
    }
  }

  // Get user principal
  getPrincipal(): string | null {
    if (!this.authClient || !this.authClient.getIdentity()) {
      // Attempt to initialize or check authentication if principal is requested before setup
      this.isAuthenticated()
        .then((auth) => {
          if (!auth) console.warn("Cannot get principal: Not authenticated.");
        })
        .catch((e) =>
          console.error("Error during principal check initialization:", e)
        );
      return null;
    }
    return this.authClient.getIdentity().getPrincipal().toString();
  }

  // Helper to convert backend errors to user-friendly messages
  private getErrorMessage(error: LoginError): string {
    if ("InvalidInput" in error)
      return "Invalid input provided. Please check your data.";
    if ("NotFound" in error) return "Resource not found.";
    if ("NotAuthorized" in error)
      return "You are not authorized to perform this action.";
    if ("AlreadyExists" in error) return "The item already exists.";
    return "An unknown error occurred.";
  }
}

// Export singleton instance of the LoginService
export const loginService = new LoginService();