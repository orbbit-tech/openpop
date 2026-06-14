"use client";

import { useState, useEffect, useRef } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { createPublicClient, http } from "viem";

const ARC_EXPLORER = "https://testnet.arcscan.app";
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;

const BALANCE_ABI = [
  {
    name: "balanceOf",
    type: "function" as const,
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view" as const,
  },
];

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function UserMenu({ balance, onSignIn }: { balance: string | null; onSignIn?: () => void }) {
  const { user, primaryWallet, handleLogOut } = useDynamicContext();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function copyAddress() {
    if (!primaryWallet?.address) return;
    navigator.clipboard.writeText(primaryWallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const email = user?.email ?? "";
  const address = primaryWallet?.address ?? "";

  // Not logged in — show a sign-in button
  if (!user) {
    return (
      <button
        onClick={onSignIn}
        style={{
          height: 30,
          padding: "0 12px",
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 500,
          cursor: "pointer",
          border: "1px solid var(--border-soft)",
          background: "var(--surface)",
          color: "var(--text-2)",
          fontFamily: "inherit",
        }}
      >
        Sign in
      </button>
    );
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account"
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "hsl(220, 14%, 91%)",
          color: "hsl(220, 9%, 52%)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1 }}>
          {email.charAt(0).toUpperCase()}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          width: 256,
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 12,
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 40px -4px rgba(0,0,0,0.12)",
          zIndex: 200,
          overflow: "hidden",
        }}>
          {/* Email */}
          <div style={{ padding: "14px 16px 12px" }}>
            <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 2px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Account
            </p>
            <p style={{ fontSize: 13, color: "#0f172a", fontWeight: 500, margin: 0, wordBreak: "break-all" }}>
              {email}
            </p>
          </div>

          <div style={{ height: 1, background: "#f1f5f9" }} />

          {/* Wallet */}
          <div style={{ padding: "12px 16px" }}>
            <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 6px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Wallet · ARC Testnet
            </p>
            {address && (
              <button
                onClick={copyAddress}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: "8px 10px",
                  cursor: "pointer",
                  fontFamily: "monospace",
                  fontSize: 12,
                  color: "#475569",
                  gap: 8,
                }}
              >
                <span>{truncateAddress(address)}</span>
                <span style={{ fontSize: 10, color: "#94a3b8", fontFamily: "inherit", flexShrink: 0 }}>
                  {copied ? "Copied!" : "Copy"}
                </span>
              </button>
            )}
          </div>

          {/* Balance */}
          <div style={{ padding: "0 16px 14px" }}>
            <div style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "10px 12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>USDC Balance</span>
              <span style={{
                fontSize: 14,
                fontWeight: 600,
                color: balance !== null ? "#0f172a" : "#94a3b8",
                fontVariantNumeric: "tabular-nums",
              }}>
                {balance !== null ? balance : "—"}
              </span>
            </div>
          </div>

          <div style={{ height: 1, background: "#f1f5f9" }} />

          {/* Actions */}
          <div style={{ padding: "8px" }}>
            <button
              onClick={async () => { setOpen(false); await handleLogOut(); }}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 8,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                color: "#ef4444",
                fontFamily: "inherit",
                textAlign: "left",
                fontWeight: 500,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface NavProps {
  onOpen?: () => void;
  txHash?: string;
  onInvest?: () => void;
  onSignIn?: () => void;
}

export function Nav({ onOpen, txHash, onInvest, onSignIn }: NavProps) {
  const { primaryWallet, user, sdkHasLoaded } = useDynamicContext();
  const [balance, setBalance] = useState<string | null>(null);
  const explorerUrl = txHash ? `${ARC_EXPLORER}/tx/${txHash}` : undefined;

  useEffect(() => {
    if (!sdkHasLoaded) return;

    if (!primaryWallet?.address || !USDC_ADDRESS) {
      setBalance(null);
      return;
    }

    const client = createPublicClient({
      transport: http(
        process.env.NEXT_PUBLIC_ARC_RPC_URL ?? "https://rpc.testnet.arc.network",
      ),
    });

    async function fetchBalance() {
      try {
        const raw = (await client.readContract({
          address: USDC_ADDRESS,
          abi: BALANCE_ABI,
          functionName: "balanceOf",
          args: [primaryWallet!.address as `0x${string}`],
        })) as bigint;
        const formatted = (Number(raw) / 1_000_000).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        setBalance(formatted);
      } catch {
        setBalance(null);
      }
    }

    fetchBalance();
    const interval = setInterval(fetchBalance, 30_000);
    return () => clearInterval(interval);
  }, [primaryWallet?.address, sdkHasLoaded]);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-soft)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        height: 52,
      }}
    >
      {/* Left: logo + env badges */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/openpop-logo.svg" alt="OpenPop" style={{ height: 32, width: "auto" }} />
        </a>

        <div style={{ width: 1, height: 16, background: "var(--border-soft)", margin: "0 2px" }} />

        {(["CRE Simulated", "Arc Testnet"] as const).map((label) => (
          <span key={label} style={{
            padding: "2px 8px",
            borderRadius: 100,
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            background: "var(--accent-bg)",
            border: "1px solid var(--border-soft)",
            color: "var(--text-3)",
          }}>
            {label}
          </span>
        ))}
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Compact balance pill (always visible when logged in) */}
        {user && balance !== null && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "3px 10px",
            borderRadius: 100,
            background: "var(--accent-bg)",
            border: "1px solid var(--border-soft)",
          }}>
            <span style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 600, letterSpacing: "0.04em" }}>USDC</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-2)", fontVariantNumeric: "tabular-nums" }}>
              {balance}
            </span>
          </div>
        )}

        {onInvest && (
          <button onClick={onInvest} style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            height: 30, padding: "0 12px", borderRadius: 4,
            fontSize: 12, fontWeight: 500, cursor: "pointer",
            border: "1px solid var(--border-soft)",
            background: "var(--surface)", color: "var(--text-2)",
            fontFamily: "inherit", transition: "color .12s, border-color .12s",
          }}>
            Invest
          </button>
        )}

        {onOpen && (
          <button onClick={onOpen} style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            height: 30, padding: "0 12px", borderRadius: 4,
            fontSize: 12, fontWeight: 500, cursor: "pointer",
            border: "1px solid var(--border-soft)",
            background: "var(--surface)", color: "var(--text-2)",
            fontFamily: "inherit", transition: "color .12s, border-color .12s",
          }}>
            For Agents
          </button>
        )}

        {txHash && explorerUrl && (
          <a href={explorerUrl} target="_blank" rel="noopener noreferrer" style={{
            display: "inline-flex", alignItems: "center",
            height: 30, padding: "0 12px", borderRadius: 4,
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            border: "1px solid var(--teal)",
            background: "var(--teal)", color: "#fff", textDecoration: "none",
          }}>
            View on-chain ↗
          </a>
        )}

        {/* User avatar + dropdown */}
        <UserMenu balance={balance} onSignIn={onSignIn} />
      </div>
    </nav>
  );
}
