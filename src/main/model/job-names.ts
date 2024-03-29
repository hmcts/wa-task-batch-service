export enum JobName {
  TERMINATION = 'TERMINATION',
  INITIATION = 'INITIATION',
  CONFIGURATION = 'CONFIGURATION',
  AD_HOC_DELETE_PROCESS_INSTANCES = 'AD_HOC_DELETE_PROCESS_INSTANCES',
  AD_HOC_UPDATE_CASE_DATA = 'AD_HOC_UPDATE_CASE_DATA',
  AD_HOC_PENDING_TERMINATION_TASKS = 'AD_HOC_PENDING_TERMINATION_TASKS',
  RECONFIGURATION = 'RECONFIGURATION',
  TASK_INITIATION_FAILURES = 'TASK_INITIATION_FAILURES',
  TASK_TERMINATION_FAILURES = 'TASK_TERMINATION_FAILURES',
  MAINTENANCE_CAMUNDA_TASK_CLEAN_UP = 'MAINTENANCE_CAMUNDA_TASK_CLEAN_UP',
  UPDATE_SEARCH_INDEX = 'UPDATE_SEARCH_INDEX',
  CLEANUP_SENSITIVE_LOG_ENTRIES = 'CLEANUP_SENSITIVE_LOG_ENTRIES',
  PERFORM_REPLICATION_CHECK = 'PERFORM_REPLICATION_CHECK',
  RECONFIGURATION_FAILURES = 'RECONFIGURATION_FAILURES'
}
