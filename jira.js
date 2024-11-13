function generateJiraMarkup(data, imageUrl) {
  return `{panel:title=Incident Reference|titleBGColor=lightsalmon}
ServiceNow Incident Reference: ${data.incident_ref}
{panel}

{panel:title=Incident Details|titleBGColor=pink}
*Dealership Information:*
Sales Consultant Name: ${data.sales_name}
Sales Consultant Lan ID: ${data.lan_id}
Dealership Code: ${data.dealer_code}

*Device Information:*
Device Type: ${data.device_type}
Device OS: ${data.device_os}
Device OS Version: ${data.os_version}
About Screenshot: ${data.screenshot_info}

*Application Information:*
Version Number: ${data.version_number}
Version Commit Hash: ${data.commit_hash}
{panel}

{panel:title=Issue|titleBGColor=darksalmon}
${data.issue_details}
{panel}

{panel:title=Add Screenshot(s) or video of issue|titleBGColor=lightgrey}
![Screenshot](${imageUrl})
{panel}`
}
