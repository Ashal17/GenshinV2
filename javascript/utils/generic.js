function utils_log_debug(mes) {
    console.log("DEBUG|" + mes);
}

function utils_log_error(err) {
    console.trace(err);
}

function utils_includes_alt_names(name, alt_names, input) {
    var result = false;

    if (name.toLowerCase().includes(input.toLowerCase())) {
        result = true
    } else if (alt_names) {
        for (var alt_name of alt_names) {
            if (alt_name.toLowerCase().includes(input.toLowerCase())) {
                result = true
                break;
            }
        }
    }

    return result;
}

function utils_array_sort(arr, key) {
    if (key) {
        if (Array.isArray(key)) {
            for (var i = 0; i < key.length; i++) {
                arr.sort((a, b) => (a[key[i]] > b[key[i]]) ? 1 : -1)
            }
        } else {
            arr.sort((a, b) => (a[key] > b[key]) ? 1 : -1)
        }

    } else {
        arr.sort((a, b) => (a > b) ? 1 : -1);
    }
    return arr;
}

function utils_array_count(array, item) {
    return array.filter(i => i === item).length;
}

function utils_array_lookup_index(array, value) {
    return array.findIndex(x => x == value);
}

function utils_array_lookup_parameter(array, parameter, value, caseinsensitive=null){
    if (caseinsensitive) {
        return array.findIndex(x => x[parameter].toLowerCase() == value.toLowerCase());
    } else {
        return array.findIndex(x => x[parameter] == value);
    }
}

function utils_array_get_by_lookup(array, parameter, value, caseinsensitive = null) {
    return array[utils_array_lookup_parameter(array, parameter, value, caseinsensitive)];
}

function utils_array_get_parameter_by_lookup(array, lookup_parameter, value, return_parameter, caseinsensitive = null) {
    return utils_array_get_by_lookup(array, lookup_parameter, value, caseinsensitive)[return_parameter];
}

function utils_capitalize(input) {
    if (typeof input !== 'string') return ''
    return input.charAt(0).toUpperCase() + input.slice(1)
}

function utils_number_format(num, round = null) {

    if (num) {
        if (round != null) {
            num = utils_number_round(num, round);
        }

        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1&nbsp;").replace(/(-)(?=(\d))/g, "$1&nbsp;");
    } else {
        return num;
    }
}

function utils_number_check_decimal_scale(num) {
    result = 0;
    while (num < 1) {
        num = num * 10;
        result++;
    }
    return Math.pow(10, result);
}

function utils_number_round(num, min_rounding) {
    var rounding = utils_number_check_decimal_scale(num)
    if (rounding > min_rounding) {
        var result = Math.round(num * rounding * min_rounding) / (rounding * min_rounding);
    } else {
        var result = Math.round(num * min_rounding) / min_rounding;
    }
    return result
}

function utils_number_verify(input_value, decimal_places, min, max) {

    if (typeof input_value === 'string') {
        input_value = input_value.replace(",", ".");
    }    

    if (isNaN(input_value) || input_value === "") {
        return null;
    } else {
        input_value = Number(input_value);
        if (input_value > max) {
            input_value = max
        } else if (input_value < min) {
            input_value = min
        }
        input_value = Math.round(input_value * Math.pow(10, decimal_places)) / Math.pow(10, decimal_places);
        return input_value;
    }
}

function utils_array_create_range(first, last, pre, post) {
    var result = [];
    if (first < last) {
        for (var i = first; i < (last + 1); i++) {
            if (pre || post) {
                result.push(pre + i + post);
            } else {
                result.push(i);    
            }
            
        }
    } else {
        for (var i = first; i > (last - 1); i--) {
            if (pre || post) {
                result.push(pre + i + post);
            } else {
                result.push(i);
            }
        }
    }

    return result;
}

function utils_object_create_add_key(obj, key, value) {
    if (obj.hasOwnProperty(key)) {
        obj[key] += value;
    } else {
        obj[key] = value;
    }
}

function utils_object_get_value(obj, path, default_value ) {

    if (obj && path) {
        for (var i = 0, path = path.split('.'), len = path.length; i < len; i++) {
            if (obj.hasOwnProperty(path[i])) {
                obj = obj[path[i]];
            } else {
                return default_value;
            }
        };
        return obj;
    } else {
        return default_value;
    }
}

function utils_object_create_key(obj, key, value) {
    if (!obj.hasOwnProperty(key)) {
        obj[key] = value;
    } 
}


