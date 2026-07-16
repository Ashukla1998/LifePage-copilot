import { Variants } from "framer-motion";

export const page = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

export const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
};

export const leftCard: Variants = {
  hidden: {
    opacity: 0,
    x: -140,
    rotate: -6,
  },

  visible: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 18,
    },
  },

  exit: {
    opacity: 0,
    x: -220,
    rotate: -10,
    transition: {
      duration: 0.4,
    },
  },
};

export const rightCard: Variants = {
  hidden: {
    opacity: 0,
    x: 140,
    rotate: 6,
  },

  visible: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 18,
    },
  },

  exit: {
    opacity: 0,
    x: 220,
    rotate: 10,
    transition: {
      duration: 0.4,
    },
  },
};

export const winner = {
  scale: [1, 1.04, 1.02],
  transition: {
    duration: 0.6,
  },
};

export const loser = {
  opacity: 0,
  scale: 0.94,
};

export const vsAnimation = {
  idle: {
    scale: [1, 1.05, 1],
    transition: {
      repeat: Infinity,
      duration: 2,
    },
  },

  fight: {
    scale: [1, 1.35, 0.9, 1],
    rotate: [0, 8, -8, 0],
    transition: {
      duration: 0.6,
    },
  },
};

export const progress = {
  type: "spring",
  stiffness: 120,
  damping: 20,
};