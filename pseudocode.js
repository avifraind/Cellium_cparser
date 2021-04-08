data = get_data_from_json_file(file)

for (entity in data.config.upload_order) {  // sorted by entity.value
    entity_data = parse_entity_key(entity.key) // returns type, techboard_number, rfic_number
    package_id = get_package_for_entity(entity_data)
    if (package_id != null) {
        connect_to_entity(entity_data)
        run_package(package_id)
    }
}

function parse_entity_key(key) {
    tokens = split_by_hyphen(key) // a function that splits a string by hyphen
    if (tokens[0] == 'toplevel') { // toplevel-row
        return {'type': 'toplevel', 'techboard_number': 0, 'rfic_number': null}
    } else if (tokens[0] == 'techboard') { // techboard-row-1
        return {'type': 'techboard', 'techboard_number': tokens[2], 'rfic_number': null}
    } else if (tokens[0] == 'rfic') { // rfic-row-2-3
        return {'type': 'rfic', 'techboard_number': tokens[2], 'rfic_number': tokens[3]}
    } else {
        // exception
    }
}

function connect_to_entity(entity_data) {
    type = entity_data.type // 'toplevel' or 'techboard' or 'rfic'
    techboard_number = entity_data.techboard_number // 0 for 'toplevel', 1,2,3,4 for 'techboard'
    rfic_number = entity_data.rfic_number
    if (type == 'toplevel') {
        write(0xFF, 0x0)
    } else if (type == 'techboard') {
        write(0xFF, techboard_number)
    }  else if (type == 'rfic') {
        write(0xFF, techboard_number)
        write(0x7F, rfic_number)
    }
}
    
function get_package_for_entity(entity_data) {
    type = entity_data.type
    techboard_number = entity_data.techboard_number
    rfic_number = entity_data.rfic_number
    if (type == 'toplevel') {
        return data.config.package_id
    } else if (type == 'techboard') {
        // look through data.techboards and find an appropriate techboard
        techboard_data = get_techboard_data_by_number(techboard_number)
        return techboard_data.package_id
    }  else if (type == 'rfic') {
        // look through data.rfics and find an appropriate rfic
        rfic_data = get_rfic_data_by_number(techboard_number, rfic_number)
        return rfic_data.package_id
    }
}

function run_package(package_id) {
    // look through data.packages and find an appropriate package
    package_data = get_package_data_by_id(package_id)
    elements = package_data.elements
    for (element in elements) {
        id = element.id
        type = element.type
        text = ""
        name = element.name
        if (type == 'script') {
            // look through data.scripts and find an appropriate script
            script_data = get_script_data_by_id(id)
            text = script_data.text
        } else if (type == 'snapshot') {
            // look through data.snapshots and find an appropriate snapshot
            snapshot_data = get_snapshot_data_by_id(id)
            text = snapshot_data.text
        }
        if (text != "") {
            execute_element(type, name, text)
        }
    }
}

function execute_element(type, name, text) {
    print('execute element', type, name)
    run(text) // a function executing a bunch of commands, for example, pulp_serial_client_run_script
}