/**
 * Viewport Scaling Script
 * Dynamically adjusts content scaling to ensure it fits within the viewport
 * while maintaining the CRT terminal aesthetic.
 */

(function() {
  // Reference to our main content element
  const mainContent = document.querySelector('main');
  const json = document.querySelector('#json');
  
  // Function to adjust content scale based on viewport and content size
  function adjustContentScale() {
    // Reset any existing scaling to measure true dimensions
    document.documentElement.style.setProperty('--content-scale', '1');
    mainContent.style.marginTop = '2vh';
    
    // Get dimensions
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const contentHeight = json ? json.scrollHeight : mainContent.scrollHeight;
    const contentWidth = json ? json.scrollWidth : mainContent.scrollWidth;
    
    // Calculate scale factors to fit content within viewport (with some margin)
    const heightScale = (viewportHeight * 0.95) / contentHeight;
    const widthScale = (viewportWidth * 0.9) / contentWidth;
    
    // Use the smaller scale to ensure content fits both dimensions
    let scale = Math.min(heightScale, widthScale);
    
    // Don't scale up beyond 1.0 or down below 0.75x to maintain readability
    scale = Math.max(0.75, Math.min(scale, 1.0));
    
    // Apply the calculated scale
    // document.documentElement.style.setProperty('--content-scale', scale.toString());
    
    // Adjust the min-height of main based on content and scale
    if (contentHeight * scale < viewportHeight * 0.7) {
      // Content is small enough to fit with room to spare
      mainContent.style.minHeight = '70vh';
    } else if (scale < 0.8) {
      // For significantly scaled-down content, reduce the min-height
      mainContent.style.minHeight = (90 * scale) + 'vh';
    }
    
    // Log scale for debugging (remove in production)
    console.log(`Content scaled by ${scale.toFixed(2)}x to fit viewport (${contentWidth}x${contentHeight})`);
  }
  
  // Apply scaling on load and resize
  window.addEventListener('load', adjustContentScale);
  window.addEventListener('resize', adjustContentScale);
  
  // Also adjust after a short delay to ensure all content is fully loaded
  setTimeout(adjustContentScale, 500);
  setTimeout(adjustContentScale, 2500); // After animation is complete
})(); 