import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Terminal,
  Brain,
  Zap,
  AlertTriangle,
  ShieldCheck,
  Wrench,
  XCircle,
  RefreshCw
} from 'lucide-react'

// Interfaces
export interface ApiResponse {
  success: boolean
  app_id?: string
  issue_id?: string
  starts_at?: string
  ends_at?: string  // "000" means unresolved
  rca?: string[]  // ["issue 1", "issue 2", ...]
  remediation?: Array<{
    error: string
    steps: string[]
  }>
  validation?: Array<{
    issue: string
    success: boolean  // true = passed, false = failed
    message: string
  }>
  remediation_actions?: Array<{
    success: boolean
    message: string
    status: string
    action: string
    podnameused: string
  }>
  processing_time?: string
}

export interface HttpError {
  status: number
  statusText: string
  message: string
}

interface ResponseDisplayProps {
  response: ApiResponse | null
  error: string | null
  httpError: HttpError | null
  isLoading: boolean
  onRetry: () => void
  onClearHttpError: () => void
}

export default function ResponseDisplay({
  response,
  error,
  httpError,
  isLoading,
  onRetry,
  onClearHttpError
}: ResponseDisplayProps) {
  return (
    <div className="min-h-[450px] flex flex-col">
      <AnimatePresence mode="wait">
        {/* Empty State */}
        {!response && !error && !httpError && !isLoading && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8"
          >
            <Terminal size={48} className="mb-4 opacity-50" />
            <p>Send an alert to see the AI analysis</p>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8"
          >
            <Loader2 size={40} className="animate-spin mb-4" />
            <p className="mb-2">Analyzing alert with AI...</p>
            <span className="text-xs opacity-70">Correlating metrics • Identifying patterns • Generating recommendations</span>
          </motion.div>
        )}

        {/* General Error */}
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="m-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-3"
          >
            <AlertCircle size={20} />
            <p>{error}</p>
          </motion.div>
        )}

        {/* HTTP Error */}
        {httpError && (
          <motion.div
            key="httpError"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="m-4"
          >
            <div className={`p-6 rounded-lg border ${
              httpError.status >= 500 
                ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-700' 
                : httpError.status === 401 || httpError.status === 403
                  ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-700'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
            }`}>
              {/* Error Status Code */}
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 flex items-center justify-center rounded-xl ${
                  httpError.status >= 500 
                    ? 'bg-red-100 dark:bg-red-500/20' 
                    : httpError.status === 401 || httpError.status === 403
                      ? 'bg-amber-100 dark:bg-amber-500/20'
                      : 'bg-slate-100 dark:bg-slate-700'
                }`}>
                  <span className={`text-2xl font-bold ${
                    httpError.status >= 500 
                      ? 'text-red-600 dark:text-red-400' 
                      : httpError.status === 401 || httpError.status === 403
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {httpError.status}
                  </span>
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${
                    httpError.status >= 500 
                      ? 'text-red-700 dark:text-red-300' 
                      : httpError.status === 401 || httpError.status === 403
                        ? 'text-amber-700 dark:text-amber-300'
                        : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {httpError.statusText}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{httpError.message}</p>
                </div>
              </div>

              {/* Suggested Actions */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Suggested Actions:</h4>
                <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                  {httpError.status === 401 && (
                    <>
                      <li className="flex items-center gap-2"><span className="text-amber-500">•</span> Check your username and password</li>
                      <li className="flex items-center gap-2"><span className="text-amber-500">•</span> Ensure your credentials are correctly configured</li>
                      <li className="flex items-center gap-2"><span className="text-amber-500">•</span> Contact administrator if issue persists</li>
                    </>
                  )}
                  {httpError.status === 403 && (
                    <>
                      <li className="flex items-center gap-2"><span className="text-amber-500">•</span> Check if you have permission for this action</li>
                      <li className="flex items-center gap-2"><span className="text-amber-500">•</span> Request access from your administrator</li>
                    </>
                  )}
                  {httpError.status === 404 && (
                    <>
                      <li className="flex items-center gap-2"><span className="text-slate-500">•</span> Verify the API endpoint URL</li>
                      <li className="flex items-center gap-2"><span className="text-slate-500">•</span> Check if the service is deployed correctly</li>
                    </>
                  )}
                  {httpError.status >= 500 && (
                    <>
                      <li className="flex items-center gap-2"><span className="text-red-500">•</span> Wait a moment and try again</li>
                      <li className="flex items-center gap-2"><span className="text-red-500">•</span> Check if the server is running</li>
                      <li className="flex items-center gap-2"><span className="text-red-500">•</span> Contact support if the issue persists</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Retry Button */}
              <div className="mt-4">
                <button 
                  className="btn btn-secondary text-sm"
                  onClick={() => {
                    onClearHttpError()
                    onRetry()
                  }}
                >
                  <RefreshCw size={14} />
                  Retry Request
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Success Response */}
        {response && (
          <motion.div
            key="response"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 space-y-4 overflow-y-auto max-h-[600px]"
          >
            {/* Status Header */}
            <div className="flex items-center gap-3 p-3 bg-success-50 dark:bg-success-500/10 border border-success-200 dark:border-success-700 rounded-lg">
              <CheckCircle2 size={20} className="text-success-500" />
              <span className="font-medium text-success-700 dark:text-success-300">Alert Processed Successfully</span>
            </div>

            {/* Alert Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-xs text-slate-500 block mb-1">App ID</span>
                <span className="text-sm font-mono font-medium text-slate-900 dark:text-white">{response.app_id}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-xs text-slate-500 block mb-1">Issue ID</span>
                <span className="text-sm font-mono font-medium text-slate-900 dark:text-white">{response.issue_id}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-xs text-slate-500 block mb-1">Started At</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">{response.starts_at ? new Date(response.starts_at).toLocaleString() : '-'}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-xs text-slate-500 block mb-1">Status</span>
                <span className={`inline-flex items-center gap-1 text-sm font-medium ${response.ends_at === '000' ? 'text-amber-600 dark:text-amber-400' : 'text-success-600 dark:text-success-400'}`}>
                  {response.ends_at === '000' ? (
                    <><AlertTriangle size={14} /> Unresolved</>
                  ) : (
                    <><CheckCircle2 size={14} /> Resolved</>
                  )}
                </span>
              </div>
            </div>

            {/* RCA Section */}
            {response.rca && response.rca.length > 0 && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  <Brain size={18} className="text-primary-500" />
                  Root Cause Analysis
                </h3>
                <ul className="space-y-2">
                  {response.rca.map((issue, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span className="text-primary-500 font-semibold">{idx + 1}.</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Remediation Steps Section */}
            {response.remediation && response.remediation.length > 0 && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  <Wrench size={18} className="text-primary-500" />
                  Remediation Steps
                </h3>
                <div className="space-y-4">
                  {response.remediation.map((item, idx) => (
                    <div key={idx} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <h4 className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                        <AlertCircle size={14} />
                        {item.error}
                      </h4>
                      <ol className="space-y-1 ml-4">
                        {item.steps.map((step, stepIdx) => (
                          <li key={stepIdx} className="text-sm text-slate-600 dark:text-slate-400 list-decimal">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Validation Section */}
            {response.validation && response.validation.length > 0 && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  <ShieldCheck size={18} className="text-primary-500" />
                  Validation Results
                </h3>
                <div className="space-y-2">
                  {response.validation.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                      {item.success ? (
                        <CheckCircle2 size={18} className="text-success-500 flex-shrink-0" />
                      ) : (
                        <XCircle size={18} className="text-red-500 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-slate-900 dark:text-white block">{item.issue}</span>
                        <span className="text-xs text-slate-500 truncate block">{item.message}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.success ? 'bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-300' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'}`}>
                        {item.success ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Remediation Actions Section */}
            {response.remediation_actions && response.remediation_actions.length > 0 && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  <Zap size={18} className="text-primary-500" />
                  Remediation Actions
                </h3>
                <div className="space-y-2">
                  {response.remediation_actions.map((action, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border ${action.success ? 'bg-success-50 dark:bg-success-500/10 border-success-200 dark:border-success-700' : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-700'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {action.success ? (
                          <CheckCircle2 size={16} className="text-success-500" />
                        ) : (
                          <XCircle size={16} className="text-red-500" />
                        )}
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{action.action}</span>
                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${action.status === 'completed' ? 'bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'}`}>
                          {action.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{action.message}</p>
                      <span className="text-xs text-slate-500 font-mono">Pod: {action.podnameused}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
