async function utils_load_file(file) {
    var response = await fetch(file);
    return await response.json();
}