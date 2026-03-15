!macro customUnInit
  DetailPrint "Shutting down RePrompt background services..."
  # Force kill the process if it's running
  nsExec::Exec 'taskkill /F /IM RePrompt.exe /T'
  # Small delay to ensure process is released
  Sleep 1000
!macroend
