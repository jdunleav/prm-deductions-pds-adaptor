import { createLogger, format, transports } from 'winston';
import { getCorrelationId } from '../middleware/correlation';

const addCorrelationInfo = format(info => {
  info.correlationId = getCorrelationId();
  return info;
});

export const options = {
  level: 'debug',
  format: format.combine(addCorrelationInfo(), format.timestamp(), format.json()),
  transports: [new transports.Console({ handleExceptions: true })]
};

const logger = createLogger(options);

export default logger;
