import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import {
  Send,
  Play,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  FileJson,
  Loader2,
  Terminal,
  Clock,
  Brain,
  Zap,
  AlertTriangle,
  ShieldCheck,
  Wrench,
  XCircle,
  Settings,
  Key,
  Wifi,
  WifiOff
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

// Configuration interface
interface Config {
  loaded: boolean
  username: string
  password: string
  apiEndpoint: string
}

// HTTP Error interface
interface HttpError {
  status: number
  statusText: string
  message: string
}

const samplePayloads = {
  prometheus: `{
  "receiver": "abcd-webhook",
  "status": "firing",
  "alerts": [
    {
      "status": "firing",
      "labels": {
        "alertname": "HighCPUUsage",
        "severity": "critical",
        "instance": "prod-api-server-01:9090",
        "job": "kubernetes-pods"
      },
      "annotations": {
        "summary": "High CPU usage detected",
        "description": "CPU usage is above 90% for more than 5 minutes on prod-api-server-01"
      },
      "startsAt": "${new Date().toISOString()}",
      "generatorURL": "http://prometheus:9090/graph"
    }
  ],
  "groupLabels": {
    "alertname": "HighCPUUsage"
  },
  "externalURL": "http://alertmanager:9093"
}`,
  grafana: `{
  "dashboardId": 1,
  "evalMatches": [
    {
      "value": 95.5,
      "metric": "memory_usage_percent",
      "tags": {
        "host": "prod-db-primary",
        "service": "postgresql"
      }
    }
  ],
  "imageUrl": "https://grafana.example.com/render/d-solo/abc123",
  "message": "Memory usage critical on production database",
  "orgId": 1,
  "panelId": 2,
  "ruleId": 1,
  "ruleName": "Database Memory Alert",
  "ruleUrl": "https://grafana.example.com/alerting/1/edit",
  "state": "alerting",
  "tags": {
    "environment": "production",
    "team": "database"
  },
  "title": "[CRITICAL] Database Memory Alert"
}`,
  datadog: `{
  "id": "1234567890",
  "title": "High Error Rate on Payment Service",
  "text": "Error rate exceeded 5% threshold on payment-service",
  "date_detected": ${Math.floor(Date.now() / 1000)},
  "alert_type": "error",
  "source_type_name": "kubernetes",
  "host": "payment-service-pod-xyz",
  "tags": [
    "env:production",
    "service:payment-service",
    "team:payments",
    "severity:high"
  ],
  "priority": "P1",
  "alert_metric": "error_rate",
  "alert_query": "avg(last_5m):sum:errors{service:payment-service}.as_rate() > 0.05"
}`,
  custom: `{
  "alert_id": "ALT-${Date.now()}",
  "source": "custom-monitoring",
  "severity": "warning",
  "title": "Custom Alert Example",
  "description": "This is a custom alert payload for testing ABCD integration",
  "timestamp": "${new Date().toISOString()}",
  "metadata": {
    "service": "example-service",
    "environment": "staging",
    "region": "us-west-2"
  },
  "metrics": {
    "value": 85.5,
    "threshold": 80,
    "unit": "percent"
  }
}`
}

interface ApiResponse {
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

export default function TestAlerts() {
  const { theme } = useTheme()
  const [payload, setPayload] = useState(samplePayloads.prometheus)
  const [selectedTemplate, setSelectedTemplate] = useState('prometheus')
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [httpError, setHttpError] = useState<HttpError | null>(null)
  const [copied, setCopied] = useState(false)
  const [config, setConfig] = useState<Config>({
    loaded: false,
    username: '',
    password: '',
    apiEndpoint: ''
  })
  const [configLoading, setConfigLoading] = useState(true)
  const [configError, setConfigError] = useState<string | null>(null)

  // Simulate loading config on mount
  useEffect(() => {
    const loadConfig = async () => {
      setConfigLoading(true)
      setConfigError(null)
      
      try {
        // Simulate API call to load config
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Simulated config - in real app, fetch from API
        setConfig({
          loaded: true,
          username: 'test',
          password: 'test.abc',
          apiEndpoint: '/api/webhook'
        })
      } catch {
        setConfigError('Failed to load configuration')
        setConfig(prev => ({ ...prev, loaded: false }))
      } finally {
        setConfigLoading(false)
      }
    }

    loadConfig()
  }, [])

  const handleTemplateChange = (template: keyof typeof samplePayloads) => {
    setSelectedTemplate(template)
    setPayload(samplePayloads[template])
    setResponse(null)
    setError(null)
    setHttpError(null)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    setHttpError(null)
    setResponse(null)

    // Check if config is loaded
    if (!config.loaded) {
      setError('Configuration not loaded. Please wait or refresh the page.')
      setIsLoading(false)
      return
    }

    try {
      JSON.parse(payload)
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Simulate random HTTP errors (10% chance) for demo
      const shouldSimulateError = Math.random() < 0.1
      if (shouldSimulateError) {
        const errors: HttpError[] = [
          { status: 401, statusText: 'Unauthorized', message: 'Invalid credentials. Please check your username and password.' },
          { status: 403, statusText: 'Forbidden', message: 'You do not have permission to access this resource.' },
          { status: 404, statusText: 'Not Found', message: 'The requested endpoint was not found.' },
          { status: 500, statusText: 'Internal Server Error', message: 'An unexpected error occurred on the server.' },
          { status: 503, statusText: 'Service Unavailable', message: 'The service is temporarily unavailable. Please try again later.' }
        ]
        const randomError = errors[Math.floor(Math.random() * errors.length)]
        setHttpError(randomError)
        setIsLoading(false)
        return
      }

      const simulatedResponse: ApiResponse = {
        success: true,
        app_id: 'APP-001',
        issue_id: `ISSUE-${Date.now()}`,
        starts_at: new Date().toISOString(),
        ends_at: '000',  // Unresolved
        rca: [
          'Memory leak detected in payment-service container',
          'High CPU usage correlated with recent deployment v2.3.1',
          'Connection pool exhaustion in database layer'
        ],
        remediation: [
          {
            error: 'Memory leak in payment-service',
            steps: [
              'Identify the memory leak source',
              'Restart the affected pod',
              'Monitor memory usage for 15 minutes'
            ]
          },
          {
            error: 'High CPU usage',
            steps: [
              'Scale deployment to 4 replicas',
              'Review recent code changes',
              'Optimize resource-intensive operations'
            ]
          }
        ],
        validation: [
          {
            issue: 'Memory usage',
            success: true,
            message: 'Memory usage normalized to 45%'
          },
          {
            issue: 'CPU usage',
            success: true,
            message: 'CPU usage reduced to normal levels'
          }
        ],
        remediation_actions: [
          {
            success: true,
            message: 'Pod restarted successfully',
            status: 'completed',
            action: 'restart_pod',
            podnameused: 'payment-service-pod-xyz'
          },
          {
            success: true,
            message: 'Deployment scaled',
            status: 'completed',
            action: 'scale_deployment',
            podnameused: 'payment-service-deployment'
          }
        ],
        processing_time: '1.2s'
      }

      setResponse(simulatedResponse)
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON syntax. Please check your payload.')
      } else {
        setError('Failed to process alert. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyPayload = async () => {
    await navigator.clipboard.writeText(payload)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    setPayload(samplePayloads[selectedTemplate as keyof typeof samplePayloads])
    setResponse(null)
    setError(null)
    setHttpError(null)
  }

  return (
    <div className="pt-16 min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 flex items-center justify-center bg-primary-50 dark:bg-primary-500/15 text-primary-500 rounded-xl">
              <Terminal size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Test Alerts</h1>
              <p className="text-slate-600 dark:text-slate-400">Test and debug webhook integrations with sample payloads</p>
            </div>
          </div>

          {/* Config Status */}
          <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${
            configLoading 
              ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700' 
              : config.loaded 
                ? 'bg-success-50 dark:bg-success-500/10 border-success-200 dark:border-success-700' 
                : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-700'
          }`}>
            {configLoading ? (
              <>
                <Loader2 size={16} className="animate-spin text-slate-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Loading config...</span>
              </>
            ) : config.loaded ? (
              <>
                <Wifi size={16} className="text-success-500" />
                <span className="text-sm text-success-700 dark:text-success-300">Config Loaded</span>
              </>
            ) : (
              <>
                <WifiOff size={16} className="text-red-500" />
                <span className="text-sm text-red-700 dark:text-red-300">Config Error</span>
              </>
            )}
          </div>
        </motion.div>

        {/* Config Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-3">
            <Settings size={18} className="text-primary-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Configuration</h3>
          </div>
          
          {configLoading ? (
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 size={14} className="animate-spin" />
              <span className="text-sm">Loading configuration...</span>
            </div>
          ) : configError ? (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-700 rounded-lg">
              <AlertCircle size={16} className="text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-300">{configError}</span>
            </div>
          ) : (
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                <Key size={16} className="text-slate-400" />
                <div>
                  <span className="text-xs text-slate-500 block">Username</span>
                  <span className="text-sm font-mono text-slate-900 dark:text-white">{config.username}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                <Key size={16} className="text-slate-400" />
                <div>
                  <span className="text-xs text-slate-500 block">Password</span>
                  <span className="text-sm font-mono text-slate-900 dark:text-white">••••••••</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                <Terminal size={16} className="text-slate-400" />
                <div>
                  <span className="text-xs text-slate-500 block">Endpoint</span>
                  <span className="text-sm font-mono text-slate-900 dark:text-white">{config.apiEndpoint}</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                <FileJson size={18} className="text-primary-500" />
                Webhook Payload
              </h2>
              <div className="flex gap-2">
                <button className="btn btn-secondary text-xs px-3 py-1.5" onClick={handleCopyPayload}>
                  {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button className="btn btn-secondary text-xs px-3 py-1.5" onClick={handleReset}>
                  <RefreshCw size={14} />
                  Reset
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <span className="text-xs font-medium text-slate-500 mr-2">Template:</span>
              {Object.keys(samplePayloads).map((template) => (
                <button
                  key={template}
                  onClick={() => handleTemplateChange(template as keyof typeof samplePayloads)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${selectedTemplate === template ? 'bg-primary-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-primary-300'}`}
                >
                  {template.charAt(0).toUpperCase() + template.slice(1)}
                </button>
              ))}
            </div>

            <div className="border-b border-slate-200 dark:border-slate-700">
              <CodeMirror
                value={payload}
                height="350px"
                theme={theme === 'dark' ? 'dark' : 'light'}
                extensions={[json()]}
                onChange={(value) => setPayload(value)}
                className="text-sm"
              />
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-semibold text-white bg-success-500 rounded">POST</span>
                <code className="text-sm text-slate-500 font-mono">/webhook</code>
              </div>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send Alert
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Response Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                <Play size={18} className="text-primary-500" />
                Response
              </h2>
              {response && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock size={14} />
                  {response.processing_time}
                </span>
              )}
            </div>

            <div className="min-h-[450px] flex flex-col">
              <AnimatePresence mode="wait">
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
                            setHttpError(null)
                            handleSubmit()
                          }}
                        >
                          <RefreshCw size={14} />
                          Retry Request
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

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
          </motion.div>
        </div>

        {/* API Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">API Reference</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: 'Webhook Endpoint', code: 'POST /webhook', desc: 'Send alert payloads from any monitoring tool' },
              { title: 'Get Alert Details', code: 'GET /alertdetails?alert_id=ID', desc: 'Retrieve full RCA and remediation for an alert' },
              { title: 'List Alerts', code: 'GET /alerts', desc: 'Get all processed alerts with status' }
            ].map((api, idx) => (
              <div key={idx} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{api.title}</h4>
                <code className="block text-xs font-mono text-primary-500 mb-2">{api.code}</code>
                <p className="text-xs text-slate-500">{api.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
