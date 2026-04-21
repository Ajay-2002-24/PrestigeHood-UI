import { authAPI } from '../services/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ROLES = [
  { id: 3, icon: '🏠', label: 'Resident',      desc: 'I live in this society' },
  { id: 4, icon: '🛡️', label: 'Security Guard', desc: 'I manage the gate'      },
  { id: 2, icon: '⚙️', label: 'Society Admin',  desc: 'I manage the society'   },
];

export default function Login() {
  const [tab,  setTab]  = useState('login');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    phone:'', password:'', fullName:'', email:'',
    societyId:1, flatId:1, relationType:'Owner', roleId:3
  });
  const { login } = useAuth();
  const nav = useNavigate();
  const s = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // ── LOGIN ────────────────────────────────────────────────
  const doLogin = async e => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await authAPI.login({ phone: form.phone, password: form.password });
      const d = r.data.data;
      login(
        { userId:d.userId, fullName:d.fullName, role:d.role, flatId:d.flatId, societyId:d.societyId },
        d.accessToken
      );
      toast.success(`Welcome, ${d.fullName.split(' ')[0]}! 🏠`);
      nav('/dashboard');
    } catch {
      toast.error('Wrong phone or password');
    } finally {
      setBusy(false);
    }
  };

  // ── REGISTER ─────────────────────────────────────────────
  const doRegister = async e => {
    e.preventDefault();
    setBusy(true);
    try {
      await authAPI.register({
        ...form,
        email:     form.email || null,   // send null if empty — fixes unique constraint
        societyId: +form.societyId,
        flatId:    +form.flatId,
        roleId:    +form.roleId,
      });
      toast.success('✅ Account created! Please sign in.');
      setTab('login');
      setForm({ phone:'', password:'', fullName:'', email:'', societyId:1, flatId:1, relationType:'Owner', roleId:3 });
    } catch(err) {
      const msg = err?.response?.data?.message
               || err?.response?.data?.Message
               || err?.response?.data?.title
               || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const selectedRole = ROLES.find(r => r.id === +form.roleId) || ROLES[0];

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'var(--bg)', overflow:'hidden' }}>

      {/* ── Left panel ── */}
      <div className="hide-mob" style={{
        flex:'0 0 42%',
        background:'linear-gradient(160deg,#0D1117 0%,#0a1a14 50%,#060D0A 100%)',
        position:'relative', display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        padding:60, borderRight:'1px solid var(--border)'
      }}>
        <div style={{ position:'absolute', top:'20%', left:'50%', transform:'translateX(-50%)', width:320, height:320, background:'radial-gradient(circle, rgba(0,212,170,0.08) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'15%', left:'20%', width:200, height:200, background:'radial-gradient(circle, rgba(78,205,196,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', textAlign:'center' }}>
          <div style={{ width:80, height:80, background:'var(--brand)', borderRadius:24, display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, margin:'0 auto 28px', boxShadow:'0 12px 40px rgba(0,212,170,0.35)', color:'#080C10', fontWeight:900 }}>P</div>
          <h1 style={{ fontSize:38, fontWeight:900, letterSpacing:'-1px', lineHeight:1.1, marginBottom:16 }}>
            Prestige<span style={{ color:'var(--brand)' }}>Hood</span>
          </h1>
          <p style={{ color:'var(--text2)', fontSize:16, lineHeight:1.7, maxWidth:320 }}>
            Your complete community management platform. Manage expenses, visitors, complaints, and more.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:40, alignItems:'flex-start' }}>
            {[
              ['💰','Household Expense Tracker'],
              ['🚪','Visitor Gate Management'],
              ['📋','Complaint Resolution'],
              ['📢','Society Announcements']
            ].map(([e,t]) => (
              <div key={t} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 18px', background:'rgba(0,212,170,0.06)', border:'1px solid rgba(0,212,170,0.12)', borderRadius:12 }}>
                <span style={{ fontSize:20 }}>{e}</span>
                <span style={{ fontSize:14, fontWeight:600, color:'var(--text2)' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:32, overflowY:'auto' }}>
        <div style={{ width:'100%', maxWidth:440, animation:'slideUp 0.4s ease' }}>

          <div style={{ marginBottom:28, textAlign:'center' }}>
            <h2 style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.5px' }}>
              {tab === 'login' ? 'Sign in to your account' : 'Create your account'}
            </h2>
            <p style={{ color:'var(--text2)', marginTop:6, fontSize:14 }}>
              {tab === 'login' ? 'Enter your credentials to continue' : 'Join your society community'}
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', background:'var(--bg3)', borderRadius:12, padding:4, marginBottom:28, gap:4 }}>
            {[['login','Sign In'],['register','Register']].map(([t,l]) => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex:1, padding:'9px', borderRadius:9, border:'none', cursor:'pointer',
                fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:13,
                transition:'var(--t)',
                background: tab===t ? 'var(--brand)' : 'transparent',
                color:      tab===t ? '#080C10'       : 'var(--text2)'
              }}>{l}</button>
            ))}
          </div>

          {/* ── LOGIN ── */}
          {tab === 'login' ? (
            <form onSubmit={doLogin}>
              <div className="fg">
                <label className="label">Phone Number</label>
                <input className="inp" type="tel" placeholder="9876543210"
                  value={form.phone} onChange={e=>s('phone',e.target.value)} required />
              </div>
              <div className="fg">
                <label className="label">Password</label>
                <input className="inp" type="password" placeholder="••••••••"
                  value={form.password} onChange={e=>s('password',e.target.value)} required />
              </div>
              <button className="btn btn-brand btn-lg" type="submit" disabled={busy}
                style={{ width:'100%', justifyContent:'center', marginTop:4 }}>
                {busy ? '⏳ Signing in...' : '→ Sign In'}
              </button>
              <div style={{ marginTop:20, padding:14, background:'var(--bg3)', borderRadius:10, border:'1px solid var(--border)' }}>
                <div style={{ fontSize:12, color:'var(--text3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:6 }}>Demo Credentials</div>
                <div style={{ fontSize:13, color:'var(--text2)' }}>Phone: <strong style={{color:'var(--brand)'}}>9999999999</strong></div>
                <div style={{ fontSize:13, color:'var(--text2)' }}>Password: <strong style={{color:'var(--brand)'}}>Test@123</strong></div>
              </div>
            </form>

          ) : (
            /* ── REGISTER ── */
            <form onSubmit={doRegister}>

              {/* Role cards */}
              <div className="fg">
                <label className="label" style={{fontSize:14, fontWeight:700}}>
                  I am a... <span style={{color:'var(--bad)'}}>*</span>
                </label>
                <div style={{display:'flex', flexDirection:'column', gap:10, marginBottom:4}}>
                  {ROLES.map(role => (
                    <div key={role.id} onClick={() => s('roleId', role.id)} style={{
                      display:'flex', alignItems:'center', gap:14,
                      padding:'14px 18px', borderRadius:14, cursor:'pointer',
                      border:     +form.roleId === role.id ? '2px solid var(--brand)' : '2px solid var(--border)',
                      background: +form.roleId === role.id ? 'rgba(0,212,170,0.08)'   : 'var(--bg3)',
                      transition: 'all 0.2s', userSelect:'none'
                    }}>
                      <div style={{
                        width:48, height:48, borderRadius:12, flexShrink:0,
                        background: +form.roleId === role.id ? 'rgba(0,212,170,0.15)' : 'var(--bg)',
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:26
                      }}>{role.icon}</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700, fontSize:15, color: +form.roleId === role.id ? 'var(--brand)' : 'var(--text)'}}>
                          {role.label}
                        </div>
                        <div style={{fontSize:12, color:'var(--text3)', marginTop:2}}>{role.desc}</div>
                      </div>
                      <div style={{
                        width:20, height:20, borderRadius:'50%', flexShrink:0,
                        border:     +form.roleId === role.id ? '6px solid var(--brand)' : '2px solid var(--border)',
                        background: 'transparent', transition:'all 0.2s'
                      }}/>
                    </div>
                  ))}
                </div>
              </div>

              {/* Name + Phone */}
              <div className="g2" style={{gap:12}}>
                <div className="fg" style={{margin:0}}>
                  <label className="label">Full Name</label>
                  <input className="inp" placeholder="Ram Kumar"
                    value={form.fullName} onChange={e=>s('fullName',e.target.value)} required />
                </div>
                <div className="fg" style={{margin:0}}>
                  <label className="label">Phone</label>
                  <input className="inp" type="tel" placeholder="9999999999"
                    value={form.phone} onChange={e=>s('phone',e.target.value)} required />
                </div>
              </div>

              {/* Email */}
              <div className="fg" style={{marginTop:12}}>
                <label className="label">Email (optional)</label>
                <input className="inp" type="email" placeholder="you@example.com"
                  value={form.email} onChange={e=>s('email',e.target.value)} />
              </div>

              {/* Password */}
              <div className="fg">
                <label className="label">Password</label>
                <input className="inp" type="password" placeholder="Min 6 characters"
                  value={form.password} onChange={e=>s('password',e.target.value)} required />
              </div>

              {/* Society + Flat — Resident only */}
              {+form.roleId === 3 && (
                <div className="g2" style={{gap:12}}>
                  <div className="fg" style={{margin:0}}>
                    <label className="label">Society ID</label>
                    <input className="inp" type="number" value={form.societyId}
                      onChange={e=>s('societyId',e.target.value)} required />
                  </div>
                  <div className="fg" style={{margin:0}}>
                    <label className="label">Flat ID</label>
                    <input className="inp" type="number" value={form.flatId}
                      onChange={e=>s('flatId',e.target.value)} required />
                  </div>
                </div>
              )}

              {/* Relation — Resident only */}
              {+form.roleId === 3 && (
                <div className="fg" style={{marginTop:12}}>
                  <label className="label">Relation</label>
                  <select className="inp" value={form.relationType}
                    onChange={e=>s('relationType',e.target.value)}>
                    {['Owner','Tenant','Family Member','Caretaker'].map(r=>(
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Summary */}
              <div style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'10px 14px', borderRadius:10, marginTop:4,
                background:'rgba(0,212,170,0.06)', border:'1px solid rgba(0,212,170,0.15)'
              }}>
                <span style={{fontSize:20}}>{selectedRole.icon}</span>
                <span style={{fontSize:13, color:'var(--text2)'}}>
                  Registering as <strong style={{color:'var(--brand)'}}>{selectedRole.label}</strong>
                </span>
              </div>

              <button className="btn btn-brand btn-lg" type="submit" disabled={busy}
                style={{ width:'100%', justifyContent:'center', marginTop:16 }}>
                {busy ? '⏳ Creating account...' : `✓ Register as ${selectedRole.label}`}
              </button>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}