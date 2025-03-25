

import { Snackbar, Alert } from '@mui/material'

  function ErrorSnackbar({ error, onClose }) {
    return (
      <Snackbar open={!!error} autoHideDuration={6000} onClose={onClose}>
        <Alert severity="error" onClose={onClose}>
          {error || "An unknown error occurred."}
        </Alert>
      </Snackbar>
    )
  }

  export default ErrorSnackbar;