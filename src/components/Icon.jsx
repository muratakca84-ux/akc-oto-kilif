// Tek tip, çizgi stilinde ikon seti (24x24, currentColor).
const paths = {
  phone:
    "M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5L16 14l4 1.5V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z",
  mail: "M4 6h16v12H4zM4 7l8 6 8-6",
  pin: "M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4.5l3 2",
  arrow: "M5 12h14m-5-5 5 5-5 5",
  check: "m5 12.5 4.5 4.5L19 7.5",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6 6 18",
  plus: "M12 5v14M5 12h14",
  seat: "M8 3h5a2 2 0 0 1 2 2v7H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm-2 9 1 5h9l2-5M9 17v4m6-4v4",
  ruler: "M3 17 17 3l4 4L7 21zM7 13l2 2m1-5 2 2m1-5 2 2",
  shield: "M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6l-7-3Zm-3 9 2 2 4-4",
  wrench:
    "M14.5 6.5a4 4 0 0 0 5 5L21 13l-8 8-3-3 8-8-1.5-1.5a4 4 0 0 1-5-5L14 6Zm-8 9-3 3 3 3 3-3",
  truck: "M3 6h11v10H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0",
  logout: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10",
  external: "M14 4h6v6m0-6-9 9M18 14v6H4V6h6",
  whatsapp:
    "M12 2a9.7 9.7 0 0 0-8.4 14.5L2 22l5.7-1.5A10 10 0 1 0 12 2Zm0 17.8c-1.5 0-3-.4-4.2-1.1l-.3-.2-3.3.9.9-3.2-.2-.3a7.8 7.8 0 1 1 7.1 3.9Zm4.3-5.8c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.6.2l-.8 1c-.1.2-.3.2-.5.1-1.4-.7-2.4-1.3-3.3-2.9-.2-.3.2-.4.7-1.1.1-.2.1-.4 0-.5l-.7-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2.1 3.2 5 4.4 1.9.8 2.7.9 3.7.7.6-.1 1.4-.6 1.6-1.1.2-.6.2-1 .2-1.1-.1-.2-.3-.3-.5-.4Z",
  instagram: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm5-9.5h.01",
  chevron: "m9 6 6 6-6 6",
};

export default function Icon({ name, size = 20, className = "", strokeWidth = 1.7 }) {
  const d = paths[name];
  if (!d) return null;
  const filled = name === "whatsapp";

  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} />
    </svg>
  );
}
