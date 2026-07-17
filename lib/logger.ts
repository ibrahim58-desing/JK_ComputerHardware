type LogLevel = 'info' | 'warn' | 'error'

interface SecurityLogEntry {
  level: LogLevel
  event: string
  timestamp: string
  ip?: string
  username?: string
  details?: Record<string, unknown>
}

function writeLog(entry: SecurityLogEntry): void {
  const line = JSON.stringify(entry)
  if (entry.level === 'error') {
    console.error(line)
  } else if (entry.level === 'warn') {
    console.warn(line)
  } else {
    console.log(line)
  }
}

export function logSecurityEvent(
  event: string,
  options: {
    level?: LogLevel
    ip?: string
    username?: string
    details?: Record<string, unknown>
  } = {}
): void {
  writeLog({
    level: options.level || 'info',
    event,
    timestamp: new Date().toISOString(),
    ip: options.ip,
    username: options.username,
    details: options.details,
  })
}

export function logFailedLogin(ip: string, username: string): void {
  logSecurityEvent('admin_login_failed', {
    level: 'warn',
    ip,
    username,
  })
}

export function logSuccessfulLogin(ip: string, username: string): void {
  logSecurityEvent('admin_login_success', { ip, username })
}

export function logLogout(username?: string): void {
  logSecurityEvent('admin_logout', { username })
}

export function logProductCreated(username: string, productId: number, name: string): void {
  logSecurityEvent('product_created', {
    username,
    details: { productId, name },
  })
}

export function logProductUpdated(username: string, productId: number): void {
  logSecurityEvent('product_updated', {
    username,
    details: { productId },
  })
}

export function logProductDeleted(username: string, productId: number): void {
  logSecurityEvent('product_deleted', {
    username,
    details: { productId },
  })
}

export function logSettingsUpdated(username: string, keys: string[]): void {
  logSecurityEvent('settings_updated', {
    username,
    details: { keys },
  })
}

export function logServerError(error: unknown, context?: string): void {
  logSecurityEvent('server_error', {
    level: 'error',
    details: {
      context,
      message: error instanceof Error ? error.message : 'Unknown error',
    },
  })
}
