"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Custom Error Boundary with Kozbeyli Aesthetic
 * Ensures the site degrades gracefully in case of UI failures.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-zinc-950 border border-zinc-800 rounded-3xl m-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6">
            <AlertTriangle size={32} />
          </div>
          <h2 className="serif text-3xl text-ivory mb-4">Küçük Bir Aksaklık Oluştu</h2>
          <p className="text-zinc-500 max-w-md mx-auto mb-8">
            Deneyimi iyileştirmek için çalışıyoruz. Lütfen sayfayı yenilemeyi deneyin.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-ivory text-black px-6 py-3 rounded-full font-bold hover:bg-gold transition-colors"
          >
            <RefreshCcw size={18} />
            Yeniden Dene
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
