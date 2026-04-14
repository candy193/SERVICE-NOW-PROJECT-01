# ServiceNow ITSM Implementation — Project 1

## Project Description

IT Service Management (ITSM) implemented on the **ServiceNow** platform. Modules covered:
- Incident Management
- Problem Management
- Change Management
- Knowledge Management
- Configuration Management (CMDB)
- Service Catalog

---

## Folder Structure

```
servicenow-itsm-project/
├── business-rules/
│   ├── incident_auto_assign.js
│   └── problem_auto_priority.js
├── client-scripts/
│   └── incident_field_validation.js
├── script-includes/
│   └── ITSMUtils.js
├── rest-api/
│   ├── scripted_rest_webservice.js
│   └── import_set_webservice.js
├── email-notifications/
│   ├── inbound_email_action.js
│   └── service_desk_notification.js
├── service-catalog/
│   ├── catalog_item_workflow.js
│   └── catalog_client_script.js
└── test-plans/
    └── test_cases.md
```

---

## Contributions

- Worked extensively on Incident, Problem, Change, and Service Catalog modules
- Implemented REST web services using scripted web services and import set web services
- Integrated Inbound Email actions with ServiceNow
- Designed and configured Service Catalog and Request Workflows
- Configured automated email notifications for the Service Desk module
- Analysed client requirements and prepared Test Plans and Test Scenarios
- Prepared Unit Test cases for each module, integration, and system testing
- Set up Test Environment to execute test cases
- Conducted Review Meetings to close all test cases
- Collaborated with vendors and customers to finalise requirements
- Involved in Analysis and Development for the project
- Ensured deliverables met agreed SLAs

---

## Technologies Used

| Technology | Purpose |
|---|---|
| ServiceNow (ITSM) | Platform |
| JavaScript (ES5) | Business Rules, Client Scripts, Script Includes |
| REST API | Integration with external systems |
| GlideRecord | Database operations |
| GlideAjax | Asynchronous client-server calls |
| XML | Import Set Web Services |

---

## How to Use

1. Copy the relevant `.js` file content
2. In ServiceNow, navigate to the appropriate module (e.g. Business Rules → New)
3. Paste the script into the Script field
4. Update table name, conditions, and field names to match your instance
5. Test in a sub-production environment before deploying to production

---

## Author

ServiceNow Developer | ITSM Implementation
