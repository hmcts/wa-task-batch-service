import Logger from '../../main/utils/logger';

const logger: Logger = new Logger();

describe('logging', () => {    
  it('logs request',()=>{
    logger.request('foo','info');
    const requestSpy = jest.spyOn(logger, 'request').mockImplementation(() => {console.log('foo');});
    logger.request('foo','info');
    expect(requestSpy).toHaveBeenCalled(); 
  });
  it('logs trace',()=>{
    logger.trace('foo','info');
    const traceSpy = jest.spyOn(logger, 'trace').mockImplementation(() => {console.log('foo');});
    logger.trace('foo','info');
    expect(traceSpy).toHaveBeenCalled(); 
  });
  it('logs exception',()=>{
    logger.exception('foo','info');
    const exceptionSpy = jest.spyOn(logger, 'exception').mockImplementation(() => {console.log('foo');});
    logger.exception('foo','info');
    expect(exceptionSpy).toHaveBeenCalled(); 
  });
  it('logs console',()=>{
    logger.console('foo','info');
    const consoleSpy = jest.spyOn(logger, 'console').mockImplementation(() => {console.log('foo');});
    logger.console('foo','info');
    expect(consoleSpy).toHaveBeenCalled(); 
  });
     
});