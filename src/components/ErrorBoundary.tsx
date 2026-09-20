import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in JJ Academy exam app:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleResetSession = () => {
    try {
      localStorage.removeItem('jj_ielts_exam_session_v2');
      localStorage.removeItem('jj_ielts_admin_authenticated');
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f0f4f8] flex flex-col items-center justify-center p-4 font-sans select-none">
          <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl w-full max-w-lg border-t-8 border-red-600 space-y-5 text-center">
            <div className="w-14 h-14 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">Application Error Detected</h2>
              <p className="text-xs text-slate-500 mt-1">
                An unexpected display error occurred. Your saved exam data and answers are preserved in cloud storage.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-left overflow-auto max-h-36">
                <p className="font-mono text-xs text-red-800 font-semibold break-words">
                  {this.state.error.message || this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleResetSession}
                className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#214162] hover:bg-[#1a334e] text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Reset to Candidate Login</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
