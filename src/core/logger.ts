import { CONFIG } from '@/config'
import { LogLevel } from '@/types'

export const loggerConfig = {
  level: CONFIG.NODE_ENV === 'development' ? 'debug' : 'info',
  transport:
    CONFIG.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
}

export const getLogLevel = (status: number) => {
  if (status >= 500) return LogLevel.Error
  if (status >= 400) return LogLevel.Warn
  return LogLevel.Info
}
