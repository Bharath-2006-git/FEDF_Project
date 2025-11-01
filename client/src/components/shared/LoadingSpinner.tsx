interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center min-h-screen transition-colors duration-300 ease-in-out">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto transition-colors duration-300 ease-in-out"></div>
        <p className="mt-2 text-muted-foreground transition-colors duration-300 ease-in-out">{message}</p>
      </div>
    </div>
  );
}
