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
  if(fbq.push!==Array.prototype.push && fbq._mock) {
    window._fbq.setMockSid('<%= sessionId %>');
    return;
  } else if (fbq.push===Array.prototype.push) {
    // do nothing
  } else {
    // restore fbq to Array
    window._fb_fbq = fbq;
    fbq = window._fbq = [];
  }
  window._fbq._mock_sid='';
  window._fbq.getMockSid=function() { return window._fbq._mock_sid; };
  window._fbq.setMockSid=function(sid) { window._fbq._mock_sid=sid; };
  window._fbq.setMockSid('<%= sessionId %>');
"
COMMENTS_FOOT="
  window._fbq._mock=true;
})(window,document,location,history);
/* jshint ignore:end */"
curl -s ${URL} >${TMPFILE}
echo "${COMMENTS_HEAD}" >${DSTFILE}
cat ${TMPFILE} | sed -e "s/g='https:\\/\\/www.facebook.com\\/tr\\/'/g='\\/tr'/g" | sed -e "s/if(2048>(g+'?'+ca).length){var da=new Image();da.src=g+'?'+ca;}else o(g,y);/if(2048>(g+window._fbq.getMockSid()+'?'+ca).length){var da=new Image();da.src=g+window._fbq.getMockSid()+'?'+ca;}else o(g+window._fbq.getMockSid(),y);/g" >>${DSTFILE}
echo "${COMMENTS_FOOT}" >>${DSTFILE}
echo 'done!'
