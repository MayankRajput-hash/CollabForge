import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';

export default function Toast() {
  const { toastMessage } = useProjects();

  if (!toastMessage) return null;

  const isSuccess = toastMessage.type === 'success';
  const isWarning = toastMessage.type === 'warning';

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '14px 20px',
      borderRadius: '12px',
      background: isSuccess ? 'rgba(16, 185, 129, 0.95)' : isWarning ? 'rgba(245, 158, 11, 0.95)' : 'rgba(99, 102, 241, 0.95)',
      color: '#ffffff',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
      fontWeight: 500,
      fontSize: '0.95rem',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      {isSuccess && <CheckCircle2 size={20} />}
      {isWarning && <AlertCircle size={20} />}
      {!isSuccess && !isWarning && <Info size={20} />}
      <span>{toastMessage.message}</span>
    </div>
  );
}
