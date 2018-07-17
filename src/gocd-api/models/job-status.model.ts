export interface BuildingInfo {
  agent: string
  agent_ip: string
  agent_uuid: string
  build_scheduled_date: number
  build_assigned_date: number
  build_preparing_date: number
  build_building_date: number
  build_completing_date: number
  build_completed_date: number
  current_status: string
  current_build_duration: string
  last_build_duration: string
  id: string
  is_completed: "true" | "false"
  name: string
  result: string
  buildLocator: string
  buildLocatorForDisplay: string
}

export interface JobStatus {
  building_info: BuildingInfo
}
