/** @type {import('tailwindcss').Config} */
export default {
  // In v4, content is auto-detected and most config happens in CSS
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "turbo-purple": "#8b5cf6",
        "turbo-indigo": "#6366f1",
        "turbo-blue": "#3b82f6",
        "dark-background": "#09090b",
        "dark-card": "#151925",
        "dark-accent": "#2d3748",
        "dark-text": "#e2e8f0",
        "dark-muted": "#a0aec0",
      },
      animation: {
        "gradient-shift": "gradient-shift 6s linear infinite",
        floating: "floating 3s ease-in-out infinite",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
        "rotate-slow": "rotate 15s linear infinite",
        shimmer: "shimmer 2s ease-in-out infinite",
        "pulse-slow": "pulse-slow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-glow": "pulse-glow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        wave: "wave 2.5s ease-in-out infinite",
      },
      keyframes: {
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        floating: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        rotate: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        shimmer: {
          "100%": { right: "100%" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "0.7" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 15px 5px rgba(139, 92, 246, 0.2)" },
          "50%": { boxShadow: "0 0 25px 10px rgba(139, 92, 246, 0.3)" },
        },
        wave: {
          "0%": { transform: "rotate(0deg)" },
          "10%": { transform: "rotate(14deg)" },
          "20%": { transform: "rotate(-8deg)" },
          "30%": { transform: "rotate(14deg)" },
          "40%": { transform: "rotate(-4deg)" },
          "50%": { transform: "rotate(10deg)" },
          "60%, 100%": { transform: "rotate(0deg)" },
        },
      },
      backgroundImage: {
        "gradient-primary":
          "linear-gradient(to right, var(--turbo-purple), var(--turbo-indigo))",
        "gradient-text":
          "linear-gradient(to right, var(--turbo-purple), var(--turbo-indigo), var(--turbo-blue))",
        "dark-gradient-text": "linear-gradient(to right, #4338ca, #5b21b6)",
      },
      backdropBlur: {
        card: "16px",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".glass-card": {
          "background-color": "rgba(21, 25, 37, 0.7)",
          "backdrop-filter": "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          "box-shadow":
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            "box-shadow":
              "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
          },
        },
        ".glass-morphism": {
          "backdrop-filter": "blur(24px)",
          "background-color": "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          "box-shadow": "0 4px 12px -2px rgba(0, 0, 0, 0.3)",
        },
        ".neo-blur": {
          "backdrop-filter": "blur(40px)",
          "background-color": "rgba(0, 0, 0, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        },
        ".shimmer": {
          position: "relative",
          overflow: "hidden",
          "&::after": {
            position: "absolute",
            top: "0",
            right: "-100%",
            width: "100%",
            height: "100%",
            "background-image":
              "linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent)",
            content: '""',
            animation: "shimmer 2s ease-in-out infinite",
          },
        },
        ".gradient-text": {
          "background-image":
            "linear-gradient(to right, var(--turbo-purple), var(--turbo-indigo), var(--turbo-blue))",
          "background-clip": "text",
          "-webkit-background-clip": "text",
          color: "transparent",
          "background-size": "200% auto",
          animation: "gradient-shift 6s linear infinite",
        },
        ".dark-gradient-text": {
          "background-image": "linear-gradient(to right, #4338ca, #5b21b6)",
          "background-clip": "text",
          "-webkit-background-clip": "text",
          color: "transparent",
          "background-size": "200% auto",
          animation: "gradient-shift 6s linear infinite",
        },
        ".btn-primary": {
          "background-image":
            "linear-gradient(to right, var(--turbo-purple), var(--turbo-indigo))",
          "background-size": "200% auto",
          color: "white",
          "font-weight": "500",
          "border-radius": "var(--radius)",
          padding: "0.625rem 1.25rem",
          "box-shadow":
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          "&:hover": {
            "background-position": "right center",
            "box-shadow":
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          },
        },
        ".btn-outline": {
          "background-color": "transparent",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "var(--dark-text)",
          "font-weight": "500",
          "border-radius": "var(--radius)",
          padding: "0.625rem 1.25rem",
          "&:hover": {
            "background-color": "rgba(255, 255, 255, 0.1)",
          },
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
