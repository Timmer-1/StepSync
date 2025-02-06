import { useRef, useState, ReactNode, MouseEvent, FocusEvent } from "react";

interface SpotlightCardProps {
    children: ReactNode;
    className?: string;
    spotlightColor?: string;
}

interface Position {
    x: number;
    y: number;
}

const SpotlightCard = ({
    children,
    className = "",
    spotlightColor = "rgba(0, 299, 255, 0.2)"
}: SpotlightCardProps) => {
    const divRef = useRef<HTMLDivElement | null>(null);
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState<number>(0);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!divRef.current || isFocused) return;

        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleFocus = (_e: FocusEvent<HTMLDivElement>) => {
        setIsFocused(true);
        setOpacity(0.6);
    };

    const handleBlur = (_e: FocusEvent<HTMLDivElement>) => {
        setIsFocused(false);
        setOpacity(0);
    };

    const handleMouseEnter = () => {
        setOpacity(0.6);
    };

    const handleMouseLeave = () => {
        setOpacity(0);
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative bg-[#0A1921]/80 backdrop-blur-sm border border-slate-700/50 ${className}`}
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out"
                style={{
                    opacity,
                    background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
                }}
            />
            {children}
        </div>
    );
};

export default SpotlightCard;