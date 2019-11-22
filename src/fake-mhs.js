import { ConnectFailover } from 'stompit';
import moment from 'moment';
import uuid from 'uuid/v4';
import save from './storage/file-system';
import config from './config';
import { generatePatientRetrievalResponse } from './templates/pds-response-template';
import logger from './config/logging';

const putResponseOnQueue = response => {
  logger.debug('Putting patient details response on queue');

  const queue = new ConnectFailover(config.queueUrl);
  queue.connect((err, client) => {
    if (err) {
      console.error(err);
    }
    client.on('error', err => {
      console.error(err);
    });

    const frame = client.send({ destination: config.queueName });
    frame.write(response);
    frame.end();
    client.disconnect();
    logger.debug('Successfully put patient details response on queue');
  });
};

const delay = fn => setTimeout(fn, 5000);

const sendMessage = (message, nhsNumber, queryId) =>
  save(message, nhsNumber).then(() => {
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const response = generatePatientRetrievalResponse(
      uuid(),
      queryId,
      timestamp,
      config.deductionsAsid,
      config.pdsAsid,
      nhsNumber,
      'AB123'
    );
    delay(() => putResponseOnQueue(response));
  });

export default sendMessage;
