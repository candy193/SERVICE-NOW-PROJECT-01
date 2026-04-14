/*
 * Script Type : Workflow — Run Script Activity
 * Name        : Service Catalog — Request Approval & Fulfillment
 * Table       : sc_req_item
 * Description : Full workflow for Service Catalog request processing
 *               including multi-level approvals, SLA tracking and
 *               fulfilment group routing.
 */


// ── Activity 1: Classify and enrich RITM ─────────────────────────
(function classifyRequest() {

    var ritm     = current;
    var itemName = ritm.cat_item.getDisplayValue().toLowerCase();
    var price    = parseFloat(ritm.price.toString()) || 0;

    // Determine approval level based on cost
    if (price === 0) {
        workflow.scratchpad.approval_level = 'none';
    } else if (price <= 500) {
        workflow.scratchpad.approval_level = 'manager';
    } else {
        workflow.scratchpad.approval_level = 'director';
    }

    // Tag with delivery type
    if (/laptop|monitor|hardware/.test(itemName)) {
        ritm.u_delivery_type = 'physical';
    } else if (/software|licence|access/.test(itemName)) {
        ritm.u_delivery_type = 'digital';
    } else {
        ritm.u_delivery_type = 'service';
    }

    ritm.setWorkflow(false);
    ritm.update();

    gs.log('RITM classified: ' + ritm.number +
           ' | Approval: ' + workflow.scratchpad.approval_level, 'CatalogWorkflow');

})();


// ── Activity 2: Create approval record ───────────────────────────
(function createApproval() {

    var level = workflow.scratchpad.approval_level;
    if (level === 'none') return; // Skip approval for free items

    var ritm     = current;
    var approver = '';

    if (level === 'manager') {
        // Get requester's manager
        var usr = new GlideRecord('sys_user');
        usr.get(ritm.request.getRefRecord().getValue('requested_for'));
        approver = usr.manager.toString();
    } else if (level === 'director') {
        // Get department director
        var dept = new GlideRecord('cmn_department');
        dept.get(ritm.request.getRefRecord().getRefRecord().getValue('department'));
        approver = dept.dept_head.toString();
    }

    if (approver) {
        var appr = new GlideRecord('sysapproval_approver');
        appr.initialize();
        appr.source_table    = 'sc_req_item';
        appr.source_id       = ritm.sys_id;
        appr.approver        = approver;
        appr.state           = 'requested';
        appr.insert();

        gs.log('Approval created for: ' + ritm.number +
               ' | Level: ' + level, 'CatalogWorkflow');
    }

})();


// ── Activity 3: Route to fulfillment group ────────────────────────
(function routeToFulfillment() {

    var ritm      = current;
    var itemName  = ritm.cat_item.getDisplayValue().toLowerCase();

    var routingMap = {
        'laptop'    : 'Hardware Fulfillment',
        'monitor'   : 'Hardware Fulfillment',
        'software'  : 'Software Distribution',
        'access'    : 'Identity & Access Management',
        'vpn'       : 'Network Operations',
        'email'     : 'Messaging & Collaboration',
        'mobile'    : 'Mobility Services',
        'onboarding': 'HR & IT Onboarding'
    };

    var groupName = 'Service Desk';
    for (var key in routingMap) {
        if (itemName.indexOf(key) !== -1) {
            groupName = routingMap[key];
            break;
        }
    }

    var grp = new GlideRecord('sys_user_group');
    grp.addQuery('name', groupName);
    grp.setLimit(1);
    grp.query();

    if (grp.next()) {
        ritm.assignment_group = grp.sys_id;
        ritm.setWorkflow(false);
        ritm.update();
    }

    workflow.scratchpad.fulfillment_group = groupName;
    gs.log('RITM routed to: ' + groupName, 'CatalogWorkflow');

})();


// ── Activity 4: Close and record fulfillment ─────────────────────
(function closeFulfilled() {

    var ritm          = current;
    ritm.state        = 3; // Closed Complete
    ritm.close_notes  = 'Fulfilled by ' + gs.getUserDisplayName() + '.';
    ritm.u_fulfilled_on = new GlideDateTime().toString();
    ritm.setWorkflow(false);
    ritm.update();

    gs.eventQueue('catalog.request.fulfilled', ritm,
        ritm.request.toString(), ritm.number.toString());

    gs.log('RITM fulfilled and closed: ' + ritm.number, 'CatalogWorkflow');

})();
