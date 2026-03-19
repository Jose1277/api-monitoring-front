export default function Spinner({ size = 20, className = '' }: { size?: number; className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            className={`animate-spin ${className}`}
        >
            <circle
                cx="12" cy="12" r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="31.416"
                strokeDashoffset="23.562"
                opacity="0.4"
            />
            <circle
                cx="12" cy="12" r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="31.416"
                strokeDashoffset="23.562"
                className="opacity-80"
                style={{ transformOrigin: 'center' }}
            />
        </svg>
    );
}
