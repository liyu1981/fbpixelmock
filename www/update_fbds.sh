#!/bin/sh

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
URL="https://connect.facebook.net/en_US/fbds.js"
TMPFILE=/tmp/fbds-`date +%s`.js
DSTFILE=${DIR}/fbds.js
COMMENTS_HEAD="/* DO NOT MODIFY THIS FILE!
 * This is file is generated & minified from ${URL}
 * Regenerate it with update_fbds.sh
*/
/* jshint ignore:start */
(function(window,document,location,history) {
  var fbq = window._fbq||(window._fbq=[]);
  if(fbq.push!==Array.prototype.push && fbq._pixeldebugger) {
    return;
  } else {
    fbq = window._fbq = [];
  }
"
COMMENTS_FOOT="
window._fbq._pixeldebugger = true;
})(window,document,location,history);
/* jshint ignore:end */"

curl -s ${URL} >${TMPFILE}
echo "${COMMENTS_HEAD}" >${DSTFILE}
cat ${TMPFILE} | sed -e "s/g='https:\\/\\/www.facebook.com\\/tr\\/'/g='\\/tr'/g" >>${DSTFILE}
echo "${COMMENTS_FOOT}" >>${DSTFILE}
echo 'done!'
