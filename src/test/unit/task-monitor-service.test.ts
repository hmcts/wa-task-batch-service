import { TaskMonitorService } from '../../main/services/task-monitor-service';
import { setupServer }  from 'msw/node';
import { http } from 'msw';
import  config  from 'config';
//import Logger from 'utils/logger';



describe('create job', () => {
  const s2sUrl = config.get('s2s.url') + '/lease';
  const tmUrl =  config.get('services.taskMonitor.url') + '/monitor/tasks/jobs';


  const realProcessExit = process.exit;
  process.exit = jest.fn(() => { throw 'mockExit'; });
  afterAll(() => { 
    process.exit = realProcessExit; 
  });
  describe ('unhappy day s2s fails', () => {
    it('it fails to creates a job', async () => {
      try {
        const tm = new TaskMonitorService();
        await tm.createJob();
        fail('should call process.exit(1)');
      }
      catch(error:unknown){
        expect(error).toEqual('mockExit');
        expect(process.exit).toBeCalledWith(1);        
      }             
    });
  });

  describe ('unhappy day taskmonitor fails', () => {
    const handlers = [
      http.post(s2sUrl, async () => {
        return new Response(JSON.stringify({ data: 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ3YV90YXNrX21vbml0b3IiLCJleHAiOjE2NzE0NzA0MTh9.jCkNjnDYv5apkVnwjsp2mtIvHoxz36STalgWImOadE3xv-o8dpQl6qCCWOwUuHjZZsn99_1qRh0xGHNJ5UtAeA' }), {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }),
    ];
    const server = setupServer(...handlers);
    beforeAll(() => {
      server.listen();
    });
    afterAll(() => {
      server.close();      
    });
    it('it fails to creates a job', async () => {
      try {
        const tm = new TaskMonitorService();
        await tm.createJob();
        fail('should call process.exit(1)');
      }
      catch(error:unknown){
        expect(error).toEqual('mockExit');
        expect(process.exit).toBeCalledWith(1);        
      }             
    });
  });
  
  describe ('happy day', () => {
    const handlers = [
      http.post(s2sUrl, () => {
        return new Response(JSON.stringify({ data: 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ3YV90YXNrX21vbml0b3IiLCJleHAiOjE2NzE0NzA0MTh9.jCkNjnDYv5apkVnwjsp2mtIvHoxz36STalgWImOadE3xv-o8dpQl6qCCWOwUuHjZZsn99_1qRh0xGHNJ5UtAeA' }), {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }),
      http.post(tmUrl, async () => {
        return new Response(JSON.stringify({'job_details':{}}), {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }),
    ];
        
    const server = setupServer(...handlers);
    beforeAll(() => {
      server.listen();
    });
    afterAll(() => {
      server.close();    
    });

    it('creates a job', async () => {    
      const tm = new TaskMonitorService();
      await expect (tm.createJob()).resolves.not.toThrowError();                      
    });
  });  
});
