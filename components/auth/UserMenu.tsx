"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

export function UserMenu() {
  const { auth, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!auth.user) return null;

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        className="user-menu-trigger"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="user-dropdown"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={auth.user.picture}
          alt=""
          className="user-avatar"
          width={32}
          height={32}
          referrerPolicy="no-referrer"
        />
        <span className="user-name">{auth.user.name.split(" ")[0]}</span>
      </button>
      {open && (
        <div className="user-menu-dropdown" id="user-dropdown" role="menu">
          <p className="user-menu-email">{auth.user.email}</p>
          <button
            className="user-menu-signout"
            onClick={signOut}
            role="menuitem"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
