import { Snackbar, Alert } from '@mui/material';
import { createRoot } from 'react-dom/client';

interface ToastProps {
  title: string;
  description: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
}

let toastRoot: any = null;

export const toast = ({ title, description, variant = 'success' }: ToastProps) => {
  if (!toastRoot) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    toastRoot = createRoot(container);
  }

  const handleClose = () => {
    toastRoot.unmount();
    toastRoot = null;
  };

  toastRoot.render(
    <Snackbar
      open={true}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={handleClose} severity={variant} sx={{ width: '100%' }}>
        <div>
          <div style={{ fontWeight: 'bold' }}>{title}</div>
          <div>{description}</div>
        </div>
      </Alert>
    </Snackbar>
  );
};
