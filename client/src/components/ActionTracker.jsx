import React, { useState } from 'react';
import { CheckSquare, Clock, User, ArrowRight, ShieldCheck, PlayCircle, CheckCircle2, RotateCcw } from 'lucide-react';

export function ActionTracker({
  recommendations = {},
  roles = {},
  activeRole,
  onSelectRole,
  onGenerateRecommendations,
  generating,
  onUpdateAction,
  onSelectCitation,
}) {
  const currentRecs = recommendations[activeRole];
  const actions = currentRecs?.actions || [];

  const todoActions = actions.filter((a) => !a.status || a.status === 'todo');
  const inProgressActions = actions.filter((a) => a.status === 'in_progress');
  const doneActions = actions.filter((a) => a.status === 'done');

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      {/* Header & Role Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid var(--border)'
      }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
            Civic Action Tracker & Role Playbooks
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Grounded actionable interventions tailored to civic stakeholder responsibilities.
          </p>
        </div>

        {/* Role tabs */}
        <div style={{ display: 'flex', gap: '0.35rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '0.5rem' }}>
          {Object.entries(roles).map(([roleKey, roleLabel]) => (
            <button
              key={roleKey}
              onClick={() => onSelectRole(roleKey)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '0.375rem',
                border: 'none',
                background: activeRole === roleKey ? '#ffffff' : 'transparent',
                color: activeRole === roleKey ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeRole === roleKey ? 600 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: activeRole === roleKey ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              {roleLabel.split('/')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {!currentRecs ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
          <CheckSquare size={32} color="var(--primary)" style={{ margin: '0 auto 0.75rem auto' }} />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            No Actions Generated for {roles[activeRole]}
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1rem auto' }}>
            Retrieve the grounded role playbook and generate prioritized, evidence-backed actions.
          </p>
          <button
            onClick={() => onGenerateRecommendations(activeRole)}
            className="btn btn-primary btn-sm"
            disabled={generating}
          >
            {generating ? 'Generating Playbook Actions...' : `Generate ${roles[activeRole]?.split('/')[0]} Playbook`}
          </button>
        </div>
      ) : (
        <div>
          {/* Action Board Kanban */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem'
          }}>
            {/* Column 1: To Do */}
            <div style={{ background: '#f8fafc', borderRadius: '0.5rem', padding: '0.75rem', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  To Do ({todoActions.length})
                </span>
                <span className="badge badge-outline" style={{ fontSize: '0.7rem' }}>Pending</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {todoActions.map((action) => (
                  <ActionCard
                    key={action.id}
                    action={action}
                    onStatusChange={(status) => onUpdateAction(activeRole, action.id, { status })}
                    onAssigneeChange={(assignee) => onUpdateAction(activeRole, action.id, { assignee })}
                    onSelectCitation={onSelectCitation}
                  />
                ))}
                {todoActions.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#94a3b8', fontSize: '0.8rem' }}>
                    No pending tasks
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: In Progress */}
            <div style={{ background: '#f0fdf4', borderRadius: '0.5rem', padding: '0.75rem', border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                  In Progress ({inProgressActions.length})
                </span>
                <span className="badge badge-good" style={{ fontSize: '0.7rem' }}>Active</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {inProgressActions.map((action) => (
                  <ActionCard
                    key={action.id}
                    action={action}
                    onStatusChange={(status) => onUpdateAction(activeRole, action.id, { status })}
                    onAssigneeChange={(assignee) => onUpdateAction(activeRole, action.id, { assignee })}
                    onSelectCitation={onSelectCitation}
                  />
                ))}
                {inProgressActions.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#94a3b8', fontSize: '0.8rem' }}>
                    No active tasks
                  </div>
                )}
              </div>
            </div>

            {/* Column 3: Completed */}
            <div style={{ background: '#f8fafc', borderRadius: '0.5rem', padding: '0.75rem', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
                  Completed ({doneActions.length})
                </span>
                <span className="badge badge-outline" style={{ fontSize: '0.7rem' }}>Verified</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {doneActions.map((action) => (
                  <ActionCard
                    key={action.id}
                    action={action}
                    onStatusChange={(status) => onUpdateAction(activeRole, action.id, { status })}
                    onAssigneeChange={(assignee) => onUpdateAction(activeRole, action.id, { assignee })}
                    onSelectCitation={onSelectCitation}
                  />
                ))}
                {doneActions.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#94a3b8', fontSize: '0.8rem' }}>
                    No completed tasks yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionCard({ action, onStatusChange, onAssigneeChange, onSelectCitation }) {
  const [editingAssignee, setEditingAssignee] = useState(false);
  const [assigneeVal, setAssigneeVal] = useState(action.assignee || '');

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid var(--border)',
      borderRadius: '0.375rem',
      padding: '0.75rem',
      boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          background: action.priority === 'urgent' ? '#fee2e2' : '#f1f5f9',
          color: action.priority === 'urgent' ? '#991b1b' : '#475569',
          padding: '0.1rem 0.4rem',
          borderRadius: '0.2rem',
          textTransform: 'uppercase'
        }}>
          {action.priority || 'standard'}
        </span>

        {action.timeframe && (
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <Clock size={11} /> {action.timeframe}
          </span>
        )}
      </div>

      <h5 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
        {action.action || action.title}
      </h5>

      {action.target_location && (
        <div style={{ fontSize: '0.75rem', color: '#0f766e', fontWeight: 600, marginBottom: '0.35rem' }}>
          📍 Target: {action.target_location}
        </div>
      )}

      {/* Citations */}
      {action.citations?.length > 0 && (
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Proof:</span>
          {action.citations.map((c) => (
            <button
              key={c}
              onClick={() => onSelectCitation(c)}
              className="citation-chip"
              style={{ fontSize: '0.7rem', padding: '0 0.3rem' }}
            >
              [{c}]
            </button>
          ))}
        </div>
      )}

      {/* Assignee & Status buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '0.5rem',
        paddingTop: '0.5rem',
        borderTop: '1px solid #f1f5f9',
        fontSize: '0.75rem'
      }}>
        {editingAssignee ? (
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <input
              type="text"
              value={assigneeVal}
              placeholder="Assignee name"
              onChange={(e) => setAssigneeVal(e.target.value)}
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem', width: '90px' }}
            />
            <button
              onClick={() => {
                onAssigneeChange(assigneeVal);
                setEditingAssignee(false);
              }}
              className="btn btn-primary btn-sm"
              style={{ padding: '0.1rem 0.3rem' }}
            >
              ✓
            </button>
          </div>
        ) : (
          <span
            onClick={() => setEditingAssignee(true)}
            style={{ color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            title="Click to assign"
          >
            <User size={12} /> {action.assignee || 'Unassigned'}
          </span>
        )}

        {/* State Transition buttons */}
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {action.status !== 'in_progress' && action.status !== 'done' && (
            <button
              onClick={() => onStatusChange('in_progress')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}
              title="Start task"
            >
              Start ➔
            </button>
          )}

          {action.status === 'in_progress' && (
            <button
              onClick={() => onStatusChange('done')}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem', background: '#166534' }}
              title="Mark as completed"
            >
              Done ✓
            </button>
          )}

          {action.status === 'done' && (
            <button
              onClick={() => onStatusChange('todo')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}
              title="Reopen task"
            >
              <RotateCcw size={10} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
