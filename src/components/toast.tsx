import { CheckCircle2 } from "lucide-react";
import { Toaster } from "react-hot-toast";

// Dans App.tsx ou index.tsx
export const ToastContainer = () => 
    <Toaster
        toastOptions={{
        error: {
            icon: '📡', 
            duration: 4000,
            style: {
                background: '#FEF2F2',
                color: '#991B1B',
                borderRadius: '20px',
                border: '1px solid #FCA5A5',
            },
        },
        success: {
            icon: <CheckCircle2/>,
            style: {
                background: '#ECFDF5',
                color: '#064E3B',
                borderRadius: '20px',
                border: '1px solid #6EE7B7',
            },
        },
        custom: {
            icon: 'ℹ️',
            duration: 4000,
            style: {
            background: '#EFF6FF', 
            color: '#1E40AF',      
            border: '1px solid #BFDBFE', 
            padding: '16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 10px 15px -3px rgba(30, 64, 175, 0.1)',
        },
        }
    }}
    />
