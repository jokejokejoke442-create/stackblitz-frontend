// Tenant context management for multi-tenant frontend

export interface TenantInfo {
  id: string;
  name: string;
  subdomain: string;
  plan: {
    name: string;
    features: Record<string, boolean>;
    limits: Record<string, number | null>;
  };
  settings: {
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
    customCSS?: string;
  };
}

export class TenantManager {
  private static instance: TenantManager;
  private tenantInfo: TenantInfo | null = null;

  static getInstance(): TenantManager {
    if (!TenantManager.instance) {
      TenantManager.instance = new TenantManager();
    }
    return TenantManager.instance;
  }

  // Extract subdomain from current URL
  getSubdomain(): string | null {
    if (typeof window === 'undefined') return null;
    
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    // For localhost development
    if (hostname.includes('localhost')) {
      const subdomain = parts[0];
      return subdomain !== 'localhost' ? subdomain : null;
    }
    
    // For production (e.g., school.educloud.com)
    if (parts.length >= 3) {
      return parts[0];
    }
    
    return null;
  }

  // Check if we're on a tenant subdomain
  isTenantDomain(): boolean {
    const subdomain = this.getSubdomain();
    return subdomain !== null && subdomain !== 'www' && subdomain !== 'app';
  }

  // Get tenant-aware API base URL
  getApiBaseUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';

    // Force school routes in development
    if (process.env.NODE_ENV === 'development') {
      return `${baseUrl}/school`;
    }

    if (this.isTenantDomain()) {
      return `${baseUrl}/school`;
    }

    return `${baseUrl}/platform`;
  }

  // Set tenant information
  setTenantInfo(info: TenantInfo) {
    this.tenantInfo = info;
    
    // Apply custom styling
    this.applyTenantStyling(info.settings);
  }

  // Get current tenant information
  getTenantInfo(): TenantInfo | null {
    return this.tenantInfo;
  }

  // Check if feature is available in current plan
  hasFeature(feature: string): boolean {
    if (!this.tenantInfo) return false;
    return this.tenantInfo.plan.features[feature] || false;
  }

  // Get usage limit for a resource
  getLimit(resource: string): number | null {
    if (!this.tenantInfo) return null;
    return this.tenantInfo.plan.limits[resource] || null;
  }

  // Apply tenant-specific styling
  private applyTenantStyling(settings: TenantInfo['settings']) {
    if (typeof document === 'undefined') return;

    // Apply CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--primary-color', settings.primaryColor);
    root.style.setProperty('--secondary-color', settings.secondaryColor);

    // Apply custom CSS if provided
    if (settings.customCSS) {
      let customStyleElement = document.getElementById('tenant-custom-styles');
      if (!customStyleElement) {
        customStyleElement = document.createElement('style');
        customStyleElement.id = 'tenant-custom-styles';
        document.head.appendChild(customStyleElement);
      }
      customStyleElement.textContent = settings.customCSS;
    }

    // Update favicon if logo is provided
    if (settings.logo) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = settings.logo;
      }
    }
  }

  // Clear tenant information
  clearTenantInfo() {
    this.tenantInfo = null;
    
    // Remove custom styling
    if (typeof document !== 'undefined') {
      const customStyleElement = document.getElementById('tenant-custom-styles');
      if (customStyleElement) {
        customStyleElement.remove();
      }
    }
  }
}

// Export singleton instance
export const tenantManager = TenantManager.getInstance();