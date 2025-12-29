/**
 * Provider Factory
 * Following SOLID principles - Factory Pattern for provider instantiation
 * Makes it easy to switch between providers (Supabase, Firebase, LocalStorage, etc.)
 */

import { IStorageProvider } from './IDataProvider';
import { SupabaseProvider } from './SupabaseProvider';
import { LocalStorageProvider } from './LocalStorageProvider';

export type ProviderType = 'supabase' | 'localStorage' | 'firebase' | 'mongodb';

interface ProviderConfig {
  type: ProviderType;
  supabase?: {
    url: string;
    key: string;
  };
  firebase?: {
    // Add Firebase config when implementing
    apiKey: string;
    authDomain: string;
    projectId: string;
  };
  // Add other provider configs as needed
}

/**
 * Factory class to create storage providers
 * Single Responsibility: Only responsible for creating provider instances
 */
export class ProviderFactory {
  private static instance: IStorageProvider | null = null;

  /**
   * Create a storage provider based on configuration
   * Open/Closed Principle: Open for extension (new providers), closed for modification
   */
  static createProvider(config: ProviderConfig): IStorageProvider {
    switch (config.type) {
      case 'supabase':
        if (!config.supabase) {
          throw new Error('Supabase configuration is required');
        }
        return new SupabaseProvider(config.supabase.url, config.supabase.key);

      case 'localStorage':
        return new LocalStorageProvider();

      case 'firebase':
        // Future implementation
        throw new Error('Firebase provider not yet implemented');

      case 'mongodb':
        // Future implementation
        throw new Error('MongoDB provider not yet implemented');

      default:
        throw new Error(`Unknown provider type: ${config.type}`);
    }
  }

  /**
   * Get or create a singleton provider instance
   * Useful for maintaining single connection throughout the app
   */
  static getInstance(config?: ProviderConfig): IStorageProvider {
    if (!this.instance && config) {
      this.instance = this.createProvider(config);
    }

    if (!this.instance) {
      throw new Error('Provider not initialized. Call getInstance with config first.');
    }

    return this.instance;
  }

  /**
   * Reset the singleton instance (useful for testing or provider switching)
   */
  static resetInstance(): void {
    this.instance = null;
  }
}

/**
 * Helper function to get provider configuration from environment
 */
export function getProviderConfigFromEnv(): ProviderConfig {
  // Check if we should use Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    return {
      type: 'supabase',
      supabase: {
        url: supabaseUrl,
        key: supabaseKey,
      },
    };
  }

  // Fallback to localStorage if no provider configured
  console.warn('No provider configured, falling back to localStorage');
  return {
    type: 'localStorage',
  };
}
