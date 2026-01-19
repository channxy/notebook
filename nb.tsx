{/* Alert Identification - Full width header style */}
<div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-2">
  <div className="flex items-center justify-between gap-4">
    <div className="min-w-0 flex-1">
      <span className="text-xs text-slate-500 block mb-1">App ID</span>
      <span className="text-sm font-mono font-medium text-slate-900 dark:text-white">{response.data.app_id || '-'}</span>
    </div>
    <div className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium ${
      response.data.ends_at === '000' || !response.data.ends_at 
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' 
        : 'bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-300'
    }`}>
      {response.data.ends_at === '000' || !response.data.ends_at ? 'Ongoing' : 'Resolved'}
    </div>
  </div>
  <div>
    <span className="text-xs text-slate-500 block mb-1">Issue ID</span>
    <span className="text-sm font-mono font-medium text-slate-900 dark:text-white break-all">{response.data.issue_id || '-'}</span>
  </div>
</div>

{/* Timestamps - 2 column grid */}
<div className="grid grid-cols-2 gap-3">
  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
    <span className="text-xs text-slate-500 block mb-1">Started At</span>
    <span className="text-sm font-medium text-slate-900 dark:text-white">{response.data.starts_at ? new Date(response.data.starts_at).toLocaleString() : '-'}</span>
  </div>
  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
    <span className="text-xs text-slate-500 block mb-1">Ended At</span>
    <span className="text-sm font-medium text-slate-900 dark:text-white">{response.data.ends_at && response.data.ends_at !== '000' ? new Date(response.data.ends_at).toLocaleString() : '-'}</span>
  </div>
</div>
