// Script to suppress source map warnings
(function() {
  // Store the original error console method
  const originalError = console.error;
  
  // Override the error method to filter out source map warnings
  console.error = function(...args) {
    // Check if this is a source map error
    if (args[0] && typeof args[0] === 'string' && 
        (args[0].includes('Source map error') || 
         args[0].includes('typed.umd.js.map'))) {
      // Ignore these errors
      return;
    }
    // Otherwise, pass through to the original error method
    return originalError.apply(this, args);
  };
})(); 