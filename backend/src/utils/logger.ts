import winston from 'winston'
import { NODE_ENV } from '../config'

const { combine, timestamp, json, printf, colorize } = winston.format

const devFormat = printf((info) => {
  const { level, message, timestamp: ts, stack, ...metadata } = info
  let msg = `${ts} [${level}]: ${String(message)}`
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`
  }
  if (stack) {
    msg += `\n${String(stack)}`
  }
  return msg
})

const logger = winston.createLogger({
  level: NODE_ENV === 'production' ? 'info' : 'debug',
  defaultMeta: { service: 'd-music-backend' },
  transports: [
    new winston.transports.Console({
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        colorize(),
        devFormat
      ),
    }),
  ],
})

if (NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(timestamp(), json()),
    })
  )
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: combine(timestamp(), json()),
    })
  )
}

export default logger
