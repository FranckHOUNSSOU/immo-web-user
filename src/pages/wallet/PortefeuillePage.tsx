import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { walletApi } from '../../api/walletApi'

export default function PortefeuillePage() {
  const navigate = useNavigate()
  const [wallet, setWallet]         = useState<any>(null)
  const [transactions, setTrans]    = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [showRetrait, setShowRetrait] = useState(false)
  const [montant, setMontant]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [retraitOk, setRetraitOk]  = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [w, t] = await Promise.all([walletApi.me(), walletApi.transactions()])
      setWallet(w)
      setTrans(Array.isArray(t) ? t : t.data || [])
    } catch (_) {}
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const demanderRetrait = async () => {
    if (!montant || Number(montant) <= 0) return
    setSubmitting(true)
    try {
      await walletApi.demandeRetrait(Number(montant))
      setRetraitOk(true); setShowRetrait(false); setMontant(''); load()
    } catch (_) {}
    setSubmitting(false)
  }

  const solde = Number(wallet?.solde || 0)

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-14 md:pt-6 pb-6"
        style={{ background: 'linear-gradient(135deg,#1A1A2E,#4B6BFF)', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.12)' }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <div>
              <p className="text-white font-bold text-lg">Mon Portefeuille</p>
              <p className="text-white/60 text-xs">Solde & transactions</p>
            </div>
          </div>
          {/* Balance card */}
          <div className="rounded-2xl p-5 text-white" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <p className="text-white/60 text-xs uppercase tracking-wide mb-1">Solde disponible</p>
            <p className="text-3xl font-bold mb-4">{loading ? '…' : solde.toLocaleString('fr-FR')} FCFA</p>
            <button onClick={() => setShowRetrait(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm"
              style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8l-8 8-8-8"/></svg>
              Demander un retrait
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-6 pb-10">

          {/* Confirmation retrait */}
          {retraitOk && (
            <div className="mb-4 px-4 py-3 rounded-xl flex items-center gap-2" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <p className="text-sm font-semibold" style={{ color: '#22C55E' }}>Demande de retrait envoyée avec succès.</p>
            </div>
          )}

          {/* Modal retrait */}
          {showRetrait && (
            <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}
              onClick={() => setShowRetrait(false)}>
              <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(40px)' }}
                onClick={e => e.stopPropagation()}>
                <h3 className="font-bold text-text-dark text-lg mb-4">Demande de retrait</h3>
                <p className="text-sm text-text-grey mb-3">Solde disponible : <strong>{solde.toLocaleString('fr-FR')} FCFA</strong></p>
                <label className="block text-sm font-semibold text-text-dark mb-1.5">Montant à retirer (FCFA)</label>
                <input type="number" value={montant} onChange={e => setMontant(e.target.value)} min={1} max={solde}
                  placeholder="Ex: 50000"
                  className="w-full border border-divider rounded-xl px-4 py-3 text-sm outline-none focus:border-primary mb-4 bg-surface-g" />
                <div className="flex gap-3">
                  <button onClick={() => setShowRetrait(false)}
                    className="flex-1 py-3.5 rounded-xl border border-divider font-bold text-sm text-text-grey">Annuler</button>
                  <button onClick={demanderRetrait} disabled={submitting || !montant || Number(montant) > solde}
                    className="flex-1 py-3.5 rounded-xl text-white font-bold text-sm disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#4B6BFF,#7B4BFF)' }}>
                    {submitting ? 'Envoi…' : 'Envoyer'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Transactions */}
          <div>
            <p className="font-bold text-text-dark mb-4">Historique des transactions</p>
            {loading ? (
              [1,2,3].map(n => <div key={n} className="h-16 bg-white rounded-2xl animate-pulse mb-3" />)
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ background: 'rgba(75,107,255,0.1)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#4B6BFF" strokeWidth={1.5} className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <p className="font-bold text-text-dark mb-1">Aucune transaction</p>
                <p className="text-text-grey text-sm">Vos commissions apparaîtront ici.</p>
              </div>
            ) : transactions.map((t: any, i: number) => {
              const isCredit = t.type === 'credit' || Number(t.montant) > 0
              return (
                <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-2xl mb-3 shadow-sm">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: isCredit ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke={isCredit ? '#22C55E' : '#EF4444'} strokeWidth={2.5} className="w-5 h-5">
                      {isCredit
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8l-8-8-8 8"/>
                        : <path strokeLinecap="round" strokeLinejoin="round" d="M12 20V4m8 8l-8 8-8-8"/>}
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-dark text-sm truncate">{t.description || (isCredit ? 'Crédit' : 'Débit')}</p>
                    <p className="text-xs text-text-grey mt-0.5">{new Date(t.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm" style={{ color: isCredit ? '#22C55E' : '#EF4444' }}>
                      {isCredit ? '+' : '-'}{Math.abs(Number(t.montant)).toLocaleString('fr-FR')} F
                    </p>
                    {t.solde_apres != null && <p className="text-[10px] text-text-grey">{Number(t.solde_apres).toLocaleString('fr-FR')} F</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
