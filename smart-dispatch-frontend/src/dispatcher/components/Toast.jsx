import React, { useEffect } from 'react'
import { Bell, X } from 'lucide-react'

export default function Toast({ message, type = 'info', onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000) // Auto-close after 5 seconds
        return () => clearTimeout(timer)
    }, [onClose])

    const styles = {
        info: { bg: '#3b82f6', icon: '📢' },
        success: { bg: '#10b981', icon: '✓' },
        warning: { bg: '#f59e0b', icon: '⚠' },
        error: { bg: '#ef4444', icon: '✕' }
    }

    const style = styles[type] || styles.info

    return (
        <>
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                background: style.bg,
                color: 'white',
                padding: '12px 20px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 9999,
                maxWidth: '400px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                animation: 'slideIn 0.3s ease-out'
            }}>
                <span style={{ fontSize: '18px' }}>{style.icon}</span>
                <span style={{ flex: 1, fontSize: '14px', fontWeight: '500' }}>{message}</span>
                <button
                    onClick={onClose}
                    style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    ×
                </button>
            </div>

            <style>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </>
    )
}
