import { useState } from "react";


type AnimationStatus = "idle" | "playing";

type AnimationState = {
    status: AnimationStatus;
};


    
export function usePathAnimation() {
    const [animationState, setAnimationState] = useState<AnimationState>({
        status: "idle",
    });

    const startAnimation = () => {
        setAnimationState((s) =>
            s.status === "idle"
                ? {status: "playing"}
            : s
        ); 
    };

    const finishAnimation = () => {
        setAnimationState((s) =>
            s.status === "playing" 
                ? {status: "idle"}
            : s
        ); 
    }

    return {
        animationState,
        startAnimation, 
        finishAnimation
    }
    
};
