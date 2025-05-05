
const const_base_64 = [
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
    "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
    "u", "v", "w", "x", "y", "z", "A", "B", "C", "D",
    "E", "F", "G", "H", "I", "J", "K", "L", "M", "N",
    "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X",
    "Y", "Z", "_", "-"
]

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
        if (Array.isArray(alt_names)) {
            for (var alt_name of alt_names) {
                if (alt_name.toLowerCase().includes(input.toLowerCase())) {
                    result = true
                    break;
                }
            }
        } else {
            if (alt_names.toLowerCase().includes(input.toLowerCase())) {
                result = true
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

function utils_array_swap(array, index1, index2) {
    if (index1 != index2 && index1 >= 0 && index2 >= 0 && index1 < array.length && index2 < array.length) {
        [array[index1], array[index2]] = [array[index2], array[index1]];
        return true;
    } else {
        return false;
    }
}

function utils_dict_lookup_property(object, parameter, value) {

    var key_names = Object.keys(object);

    for (var i = 0; i < key_names.length; i++) {
        if (Array.isArray(object[key_names[i]][parameter])) {
            for (var ii = 0; ii < object[key_names[i]][parameter].length; ii++) {
                if (object[key_names[i]][parameter][ii] == value) {
                    return key_names[i];
                }
            }
        } else {
            if (object[key_names[i]][parameter] == value) {
                return key_names[i];
            }
        }

    }
}

function utils_capitalize(input) {
    if (typeof input !== 'string') return ''
    return input.charAt(0).toUpperCase() + input.slice(1)
}


function utils_random_alphanumerical(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
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
    if (num != 0) {
        while (Math.abs(num) < 1) {
            num = num * 10;
            result++;
        }
    }    
    return Math.pow(10, result);
}

function utils_number_round(num, min_rounding) {
    var rounding = utils_number_check_decimal_scale(num);
    var min_rounding = Math.pow(10, min_rounding);
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

function utils_hash(input) {
    var hash = 0,
        i, chr;
    if (input.length === 0) return hash;
    for (i = 0; i < input.length; i++) {
        chr = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

function utils_url_set(url) {
    try {
        history.replaceState(null, '', url);
    }
    catch (err) {
        console.log(err);
    }
}

function utils_url_short(old_url) {
    new_url = "";
    sub_url = 0;
    for (var i = 0; i < old_url.length; i++) {
        if (old_url[i] == "0" && sub_url < 63) {
            sub_url++;
            if (i == (old_url.length - 1)) {
                if (sub_url > 1) {
                    sub_url64 = utils_base_convert(sub_url, 10, 64)
                    new_url += "!" + sub_url64;
                } else {
                    new_url += "0";
                }
            }
        } else {
            if (sub_url == 1) {
                new_url += "0";
            } else if (sub_url > 0) {
                sub_url64 = utils_base_convert(sub_url, 10, 64)
                new_url += "!" + sub_url64;
            }
            if (old_url[i] == "0" && sub_url == 63) {
                sub_url = 1;
            } else {
                sub_url = 0;
                new_url += old_url[i];
            }
        }
    }
    return new_url;
}

function utils_url_long(old_url) {
    var new_url = "";
    var sub_url = false;
    if (old_url) {
        for (var i = 0; i < old_url.length; i++) {
            if (old_url[i] == "!") {
                sub_url = true;
            } else if (sub_url == true) {
                sub_url = false;
                var count = utils_base_convert(old_url[i], 64, 10);
                for (var j = 0; j < count; j++)
                    new_url += "0";
            } else {
                new_url += old_url[i];
            }
        }
    }
    return new_url;
}

function utils_base_convert(input, input_base, output_base) {
    if (input_base == 2 && output_base == 10) {
        return utils_base_convert_2_10(input);
    } else if (input_base == 2 && output_base == 64) {
        return utils_base_convert_2_64(input);
    } else if (input_base == 10 && output_base == 2) {
        return utils_base_convert_10_2(input);
    } else if (input_base == 10 && output_base == 64) {
        return utils_base_convert_10_64(input);
    } else if (input_base == 64 && output_base == 2) {
        return utils_base_convert_64_2(input);
    } else if (input_base == 64 && output_base == 10) {
        return utils_base_convert_64_10(input);
    }
    throw "Invalid base convert parameters input_base: " + input_base + ", output_base: " + output_base;
}

function utils_base_convert_2_10(input) {
    if (input || input === 0) {
        return parseInt(input, 2);
    }
    return "";
}

function utils_base_convert_2_64(input) {
    if (input || input === 0) {
        while ((input.length % 6) != 0) {
            input = "0" + input;
        }
        var spl = input.match(/.{1,6}/g);
        var result = "";
        for (var i = 0; i < spl.length; i++) {
            a = parseInt(spl[i], 2);
            result += const_base_64[a];
        }
        return result;
    }
    return "";
}

function utils_base_convert_10_2(input) {
    if (input || input === 0) {
        return parseInt(input, 10).toString(2);
    }
    return "";
}

function utils_base_convert_10_64(input) {
    return utils_base_convert_2_64(utils_base_convert_10_2(input));
}

function utils_base_convert_64_2(input) {

    var spl = input.split("");
    var result = "";

    for (var i = 0; i < spl.length; i++) {
        var a = utils_base_convert_10_2(const_base_64.indexOf(spl[i]));
        while (a.length < 6) {
            a = "0" + a;
        }
        result += a;
    }

    return result;
}

function utils_base_convert_64_10(input) {
    if (input || input === 0) {
        var spl = input.split("");
        var result = 0;
        for (var i = 0; i < spl.length; i++) {
            var a = const_base_64.indexOf(spl[i]);
            var exp = spl.length - i - 1;
            result += a * Math.pow(64, exp);;
        }
        return result.toString();
    }
    return "";
}
