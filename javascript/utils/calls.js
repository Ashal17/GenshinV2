async function utils_load_file(file) {
    var response = await fetch(file);
    return await response.json();
}

function utils_local_storage_copy(item1, item2) {
    var value = localStorage.getItem(item1);
    value = utils_local_storage_check_null(value);
    localStorage.setItem(item2, value);
}

function utils_local_storage_swap(item1, item2) {
    var value1 = localStorage.getItem(item1);
    value1 = utils_local_storage_check_null(value1);
    var value2 = localStorage.getItem(item2);
    value2 = utils_local_storage_check_null(value2);
    localStorage.setItem(item2, value1);
    localStorage.setItem(item1, value2);
}

function utils_local_storage_check_null(value) {
    if (value == null || value == "null") { return "" } else { return value }
}