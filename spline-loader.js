// Spline 3D Animation Loader
class SplineLoader {
  constructor() {
    this.container = document.getElementById('spline-3d');
    this.init();
  }

  async init() {
    if (!this.container) return;

    try {
      // Show loading state
      this.showLoading();

      // Import Spline runtime dynamically
      const SplineRuntime = await import('https://unpkg.com/@splinetool/runtime@1.0.0/build/runtime.js');
      
      // Initialize Spline application
      const app = new SplineRuntime.Application(this.container, {
        // Scene URL from your code
        scene: 'https://prod.spline.design/5A6coXpJkn-O7e6C/scene.splinecode',
        // Optional configurations
        onLoad: () => {
          console.log('Spline scene loaded successfully');
        },
        onError: (error) => {
          console.error('Error loading Spline scene:', error);
          this.showError();
        }
      });

    } catch (error) {
      console.error('Failed to initialize Spline:', error);
      this.showError();
    }
  }

  showLoading() {
    if (this.container) {
      this.container.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f8f9fa; border-radius: 16px; border: 1px solid #e5e7eb;">
          <div style="text-align: center; color: #6b7280;">
            <div style="font-size: 48px; margin-bottom: 16px;">🎨</div>
            <div style="font-size: 14px;">Loading 3D Animation...</div>
            <div style="font-size: 12px; margin-top: 8px;">Please wait</div>
          </div>
        </div>
      `;
    }
  }

  showError() {
    if (this.container) {
      this.container.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f8f9fa; border-radius: 16px; border: 1px solid #e5e7eb;">
          <div style="text-align: center; color: #6b7280;">
            <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
            <div style="font-size: 14px;">3D Animation</div>
            <div style="font-size: 12px; margin-top: 8px;">Unable to load content</div>
          </div>
        </div>
      `;
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new SplineLoader();
});
