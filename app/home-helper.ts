'use server';

// This server action checks if the homepage exists and can be rendered
// It helps diagnose issues with the homepage rendering

export async function checkHomepageStatus() {
  try {
    // Check if the homepage component exists
    const fs = require('fs');
    const path = require('path');
    
    const pageExists = fs.existsSync(path.join(process.cwd(), 'app', 'page.tsx'));
    const routeExists = fs.existsSync(path.join(process.cwd(), 'app', 'route.ts'));
    
    return {
      success: true,
      pageExists,
      routeExists,
      message: `Homepage check: page.tsx ${pageExists ? 'exists' : 'missing'}, route.ts ${routeExists ? 'exists and might conflict' : 'doesn\'t exist'}`
    };
  } catch (error) {
    console.error('Error checking homepage status:', error);
    return {
      success: false,
      error: String(error)
    };
  }
} 