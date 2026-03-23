export default function LoadingDots() {
    return (
        <span className="inline-flex items-end gap-[3px] ml-1 mb-[1px]">
            <span className="w-[3px] h-[3px] rounded-full bg-current animate-bounce [animation-delay:0ms]" />
            <span className="w-[3px] h-[3px] rounded-full bg-current animate-bounce [animation-delay:150ms]" />
            <span className="w-[3px] h-[3px] rounded-full bg-current animate-bounce [animation-delay:300ms]" />
        </span>
    );
}
