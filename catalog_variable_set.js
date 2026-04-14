/*
 * Script Type : Catalog Variable Set — Client Script
 * Name        : ITSM Catalog Variable Set — Dynamic Variables
 * Description : Drives dynamic behaviour of variable sets used
 *               across multiple catalog items. Controls which
 *               fields appear based on user selections.
 *
 * Navigate to: Service Catalog → Variable Sets → New
 * Attach to catalog items. Paste into Client Script field.
 */


// ── onLoad: initialise variable set ──────────────────────────────
function onLoad() {

    // Get the catalog item type from a hidden variable
    var itemType = g_form.getValue('u_item_type');

    // Show correct section based on item type
    showSectionForType(itemType);

    // Pre-fill employee details from user record
    prefillUserDetails();
}


// ── onChange: u_request_type ──────────────────────────────────────
function onChange(control, oldValue, newValue, isLoading) {

    if (isLoading) return;

    // Clear all optional fields when type changes
    var optionalFields = [
        'u_software_name', 'u_licence_type', 'u_expiry_date',
        'u_asset_tag', 'u_delivery_address', 'u_system_name',
        'u_access_level', 'u_access_duration'
    ];
    optionalFields.forEach(function(f) { g_form.clearValue(f); });

    showSectionForType(newValue);
}


// ── Helper: show the correct section based on request type ────────
function showSectionForType(type) {

    // All optional sections hidden by default
    var allSections = ['Software Details', 'Hardware Details', 'Access Details', 'Service Details'];
    allSections.forEach(function(s) { g_form.setSectionDisplay(s, false); });

    var sectionMap = {
        'software' : 'Software Details',
        'hardware' : 'Hardware Details',
        'access'   : 'Access Details',
        'service'  : 'Service Details'
    };

    if (sectionMap[type]) {
        g_form.setSectionDisplay(sectionMap[type], true);
    }

    // Mandatory rules per type
    g_form.setMandatory('u_software_name',   type === 'software');
    g_form.setMandatory('u_asset_tag',       type === 'hardware');
    g_form.setMandatory('u_delivery_address',type === 'hardware');
    g_form.setMandatory('u_system_name',     type === 'access');
    g_form.setMandatory('u_access_level',    type === 'access');
}


// ── Helper: pre-fill user details using GlideAjax ────────────────
function prefillUserDetails() {

    var userId = g_user.userID;
    if (!userId) return;

    var ga = new GlideAjax('ITSMUtils');
    ga.addParam('sysparm_name', 'getUserDetails');
    ga.addParam('sysparm_user_id', userId);

    ga.getXMLAnswer(function(answer) {
        if (!answer) return;
        try {
            var details = JSON.parse(answer);
            if (details.department) g_form.setValue('u_department', details.department);
            if (details.location)   g_form.setValue('u_location',   details.location);
            if (details.manager)    g_form.setValue('u_manager',     details.manager);
        } catch (e) {
            gs.log('Error parsing user details: ' + e, 'CatalogVariableSet');
        }
    });
}
