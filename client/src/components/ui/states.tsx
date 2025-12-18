import { LoaderCircle } from "lucide-react";

export function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <LoaderCircle className="w-8 h-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground">{text}</p>
        </div>
    );
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
}: {
    icon: any;
    title: string;
    description?: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>
            )}
            {action}
        </div>
    );
}

export function ErrorState({
    title = "Something went wrong",
    description = "We couldn't load this content. Please try again.",
    onRetry,
}: {
    title?: string;
    description?: string;
    onRetry?: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="font-semibold text-lg mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                    Try Again
                </button>
            )}
        </div>
    );
}
