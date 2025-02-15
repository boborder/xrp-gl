"use client"

import { useStore } from "../hooks/useStore";

export const Alert = () => {
  const [cookie, setCookie] = useStore({
    key: 'cookie',
    init: false,
    store: {
      onSet: (key, data) => localStorage.setItem(key as string, JSON.stringify(data)),
      onGet: (key) => JSON.parse(localStorage.getItem(key as string) || 'false'),
    },
  });
  const [alert, setAlert] = useStore({ key: 'alert', init: true });

  return (
    alert && !cookie && (
      <div role="alert" className="alert bg-opacity-30">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info h-6 w-6 shrink-0">
          <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <title>q</title>
      </svg>
      <span>we use cookies for no reason.</span>
      <div className="flex gap-2">
        <button className="btn-sm btn-accent" onMouseDown={() => setAlert(false)}>
          Deny
        </button>
        <button className="btn-sm btn-primary" onMouseDown={() => setCookie(true)}>
          Accept
        </button>
      </div>
    </div>
    )
  );
};
