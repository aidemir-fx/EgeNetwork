import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React tree:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white">Произошла ошибка</h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Что-то пошло не так при отображении страницы. Нажмите кнопку ниже для перезагрузки.
            </p>
            {this.state.error && (
              <div className="bg-slate-950 p-3 rounded-xl text-xs text-red-300 font-mono text-left overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#FF6B35] hover:bg-[#E65A22] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Перезагрузить страницу</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
