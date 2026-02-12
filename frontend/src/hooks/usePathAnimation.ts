import { useState } from "react";


type AnimationStatus = "idle" | "playing";

type AnimationState = {
    status: AnimationStatus;
    edgeKeys: string[];
};


export function usePathAnimation() {
    const [animationState, setAnimationState] = useState<AnimationState>({
        status: "idle",
        edgeKeys: [],
    });

    const startAnimation = (edgeKeys: string[]) => {
        if (edgeKeys.length === 0) return false;

        setAnimationState((s) =>
            s.status === "idle"
                ? {status: "playing", edgeKeys: [...edgeKeys]}
            : s
        );

        return true;
    };

    const finishAnimation = () => {
        setAnimationState((s) =>
            s.status === "playing" 
                ? {status: "idle", edgeKeys: []}
            : s
        ); 
    }

    return {
        animationState,
        startAnimation, 
        finishAnimation
    }
    
};
