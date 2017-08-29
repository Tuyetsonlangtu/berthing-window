/**
 * Created by Administrator on 7/11/2017.
 */

$(document).ready(function () {
  var strDate = '2016-10-22', number = 9;
  var berthData = {
    "0042RL": [{
      "id": 0,
      "idx": 0,
      "name": "A1",
      "start_postion": 0,
      "end_position": 365,
      "from_bitt": 1,
      "to_bitt": 14,
      "group": "NALT",
      "length": 365,
      "depth": null,
      "direction": "0042RL"
    }], "berth_total_width": 365
  }
  var bitts =  [{"id":0,"idx":0,"name":"01","start_position":0,"end_position":0,"start_position_original":0,"end_position_original":null,"berth_idx":"0"},{"id":1,"idx":1,"name":"02","start_position":0,"end_position":0,"start_position_original":26.2,"end_position_original":null,"berth_idx":"0"},{"id":2,"idx":2,"name":"03","start_position":0,"end_position":0,"start_position_original":52.2,"end_position_original":null,"berth_idx":"0"},{"id":3,"idx":3,"name":"04","start_position":0,"end_position":0,"start_position_original":78.3,"end_position_original":null,"berth_idx":"0"},{"id":4,"idx":4,"name":"05","start_position":0,"end_position":0,"start_position_original":104.4,"end_position_original":null,"berth_idx":"0"},{"id":5,"idx":5,"name":"06","start_position":0,"end_position":0,"start_position_original":130.5,"end_position_original":null,"berth_idx":"0"},{"id":6,"idx":6,"name":"07","start_position":0,"end_position":0,"start_position_original":156.5,"end_position_original":null,"berth_idx":"0"},{"id":7,"idx":7,"name":"08","start_position":0,"end_position":0,"start_position_original":182.6,"end_position_original":null,"berth_idx":"0"},{"id":8,"idx":8,"name":"09","start_position":0,"end_position":0,"start_position_original":208.7,"end_position_original":null,"berth_idx":"0"},{"id":9,"idx":9,"name":"10","start_position":0,"end_position":0,"start_position_original":234.7,"end_position_original":null,"berth_idx":"0"},{"id":10,"idx":10,"name":"11","start_position":0,"end_position":0,"start_position_original":260.8,"end_position_original":null,"berth_idx":"0"},{"id":11,"idx":11,"name":"12","start_position":0,"end_position":0,"start_position_original":286.89,"end_position_original":null,"berth_idx":"0"},{"id":12,"idx":12,"name":"13","start_position":0,"end_position":0,"start_position_original":313,"end_position_original":null,"berth_idx":"0"},{"id":13,"idx":13,"name":"14","start_position":0,"end_position":0,"start_position_original":339,"end_position_original":null,"berth_idx":"0"}]
  var vesselData = [{"id":"CAT00100012016","berth_id":"0","code":"CAT001/0001/2016","vsl_voy_no":"CAT001/0001/2016","name":"CATTLEYA ACE","LOA":199.99,"LBP":0,"bridge_to_stern":170,"vessel_color":"#a6eb12","calling_status_color":"#a6eb12","calling_type_color":"","service_lane_color":"","along_side":"0123P","along_side_name":"P","head_position":296,"berth_dir_cd":"0042RL","status":"P","status_code":"0103P","eta_date":"22/10/2016 03:30","etb_date":"17/10/2016 12:00","etd_date":"23/10/2016 16:00","ata_date":"","atb_date":"","atd_date":"","stern_ramp":{"ramp_width":5,"ramp_start_position":3,"ramp_degree":150,"ramp_occupied_distance":10},"side_ramp":{"ramp_width":8,"ramp_start_position":100,"ramp_degree":90,"ramp_occupied_distance":8},"operator_cd":"NYK","mooring_head":"13","mooring_stern":"2","volume_d":"0","volume_l":"0","volume_r":"0","data_error":false,"vsl_tp_nm":"PCTC(RORO)","vsl_opr_nm":"NYK LINE (THAILAND) CO.,LTD."},{"id":"MON00200042016","berth_id":"0","code":"MON002/0004/2016","vsl_voy_no":"MON002/0004/2016","name":"MONZA EXPRESS","LOA":168.06,"LBP":0,"bridge_to_stern":145,"vessel_color":"#a6eb12","calling_status_color":"#a6eb12","calling_type_color":"","service_lane_color":"","along_side":"0123S","along_side_name":"S","head_position":34,"berth_dir_cd":"0042RL","status":"P","status_code":"0103P","eta_date":"24/10/2016 10:00","etb_date":"24/10/2016 10:00","etd_date":"25/10/2016 17:00","ata_date":"","atb_date":"","atd_date":"","operator_cd":"NYK","mooring_head":"1","mooring_stern":"9","volume_d":"0","volume_l":"0","volume_r":"0","data_error":false,"vsl_tp_nm":"PCTC(RORO)","vsl_opr_nm":"NYK LINE (THAILAND) CO.,LTD."}]
  MapCanvas.draw(strDate, number, berthData, bitts, vesselData);
});
