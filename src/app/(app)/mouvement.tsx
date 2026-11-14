"use client";

import { MotionConfig } from "motion/react";

/** Une seule règle pour toutes les animations du site : elles s'effacent si l'utilisateur le demande. */
export function Mouvement({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
