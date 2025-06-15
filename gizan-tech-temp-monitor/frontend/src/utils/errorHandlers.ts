// Suppress ResizeObserver loop errors
const IGNORED_ERRORS = [
  'ResizeObserver loop limit exceeded',
  'ResizeObserver loop completed with undelivered notifications'
];

const originalConsoleError = console.error;

// Override console.error to filter out specific errors
console.error = (...args: any[]) => {
  const errorMessage = args[0]?.message || args[0]?.toString() || '';
  
  // Check if the error message contains any of the ignored patterns
  const shouldIgnore = IGNORED_ERRORS.some(ignoredError => 
    errorMessage.includes(ignoredError)
  );
  
  if (!shouldIgnore) {
    originalConsoleError.apply(console, args);
  }
};

// Export a function to restore the original console.error if needed
export const restoreConsoleError = () => {
  console.error = originalConsoleError;
};
