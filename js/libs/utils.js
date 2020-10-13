function DGE(e){
  return document.getElementById(e);
}
function DCE(name, class1, class2, class3, class4){
  var rtn =  document.createElement(name);
  var rtc = rtn.classList;
  if(class1) rtc.add(class1);
  if(class2) rtc.add(class2);
  if(class3) rtc.add(class3);
  if(class4) rtc.add(class4);
  return rtn;
}
function CLEAR(el){
  while (el.firstChild) {
    el.removeChild(el.lastChild);
  }
}

function PUTSTR(arr, str, ptr){
  arr[ptr++] = (str.length >> 8);
  arr[ptr++] = str.length;
  for(var x = 0; x < str.length; x++){
    arr[ptr++] = str.charCodeAt(x);
  }
  return ptr;
}

function GETSTR(arr, ptr){
  var len = arr[ptr++] * 256 + arr[ptr++];
  var rtn = "";
  for(var x = 0; x < len; x++){
    var val = arr[ptr++];
    assert(val != 0, "Null Char in String");
    rtn += String.fromCharCode(val);
  }
  return rtn;
}

/**
 * Place a Uint8Array inside another, with markers for length
 * @param {Uint8Array} arr destination array
 * @param {Uint8Array} arrIn source array
 * @param {Integer} ptr current pointer in source array
 * @param {Integer} numBytes number of bytes used to specify destination array length
 * @returns {Integer} new pointer in source array
 */
function PUTARR(arr, arrIn, ptr, numBytes){
  if(numBytes >= 4)
    arr[ptr++] = (arrIn.length >> 24);
  if(numBytes >= 3)
    arr[ptr++] = (arrIn.length >> 16);
  arr[ptr++] = (arrIn.length >> 8);
  arr[ptr++] = arrIn.length;
  for(var x = 0; x < arrIn.length; x++){
    arr[ptr++] = arrIn[x];
  }
  return ptr;
}

function assert(bool, str){
  if(str)
    if(!bool) throw "Assertion failed: " + str;
  else
    if(!bool) throw "Assertion failed";
}

function tween(arr1, arr2, frac){
  if(arr1.length != arr2.length)
    throw "Tween Length Mismatch";
  var rtn = Array(arr1.length);
  if(arr1.length == undefined){
    return arr1 * (1-frac) + arr2 * frac;
  }
  for(var x = 0; x < arr1.length; x++){
    var v1 = arr1[x];
    var v2 = arr2[x];
    if(typeof(v1) != typeof(v2))
      throw "Tween Type Mismatch";
    if(typeof(v1) == "object"){
      rtn[x] = tween(arr1[x], arr2[x], frac);
    } else{
      rtn[x] = v1 * (1-frac) + v2 * frac;
    }
  }
  return rtn;
}

function tweenIn(arrOfArrs, idx){
  var len = arrOfArrs.length;
  idx = Math.max(idx, 0);
  var idxLow = Math.floor(idx);
  var idxHigh = Math.ceil(idx);
  if(idxLow == idxHigh)
    return arrOfArrs[idx % len];
  idxLow %= len;
  idxHigh %= len;
  return tween(arrOfArrs[idxLow], arrOfArrs[idxHigh], idx % 1);
}
